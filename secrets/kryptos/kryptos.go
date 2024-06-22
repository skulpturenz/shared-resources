package kryptos

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"fmt"
	"log/slog"
	"os"

	"github.com/dogmatiq/ferrite"
	"github.com/google/uuid"
	_ "github.com/jackc/pgx/v5/stdlib"
	_ "github.com/mattn/go-sqlite3"
)

type contextKey string

var (
	ContextKeyDebug = contextKey("debug")
	VERSION         = "0.0.1"
	PROJECT         = ferrite.
			String("PROJECT", "Project to load environments for").
			WithDefault("*").
			Required()
	DB_DRIVER = ferrite.
			Enum("DB_DRIVER", "Database driver").
			WithMembers("sqlite3", "pgx").
			WithDefault("sqlite3").
			Required()
	DB_CONNECTION_STRING = ferrite.
				String("DB_CONNECTION_STRING", "Database connection string").
				Required()
	ENCRYPTION_KEY = ferrite.
			String("ENCRYPTION_KEY", "32 byte encryption key, `openssl rand -hex 32`").
			Required()
)

var ENVS = map[string]string{}

func GetEnvs(ctx context.Context, db *sql.DB) {
	isDebugEnabled := ctx.Value(ContextKeyDebug).(bool)

	envs, err := db.PrepareContext(ctx, `SELECT key, value 
		FROM environments
		WHERE deprecated = 0 AND project IN ($1, '*');`)
	if err != nil {
		panic(err)
	}
	defer envs.Close()

	rows, err := envs.QueryContext(ctx, PROJECT.Value())
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	for rows.Next() {
		var key string
		var encrypted string
		err = rows.Scan(&key, &encrypted)
		if err != nil {
			panic(err)
		}

		if isDebugEnabled {
			slog.InfoContext(ctx, "get", "env", key)
		}

		decrypted := decrypt(encrypted, ENCRYPTION_KEY.Value())

		if isDebugEnabled {
			slog.InfoContext(ctx, "decrypt", "env", key)
		}

		ENVS[key] = decrypted
	}

	err = rows.Err()
	if err != nil {
		panic(err)
	}
}

func DeleteEnv(ctx context.Context, db *sql.DB, key string, includeDeprecated bool, withGlobal bool) {
	isDebugEnabled := ctx.Value(ContextKeyDebug).(bool)

	inProjectFilter := ""
	if withGlobal {
		inProjectFilter = "($2, '*')"
	} else {
		inProjectFilter = "($2)"
	}

	inDeprecatedFilter := ""
	if includeDeprecated {
		inDeprecatedFilter = "(0, 1)"
	} else {
		inDeprecatedFilter = "(1)"
	}

	statement := ""
	if !includeDeprecated {
		statement = fmt.Sprintf(`DELETE FROM environments 
			WHERE key = $1 
			AND project IN %s 
			AND deprecated %s
			RETURNING key;`, inProjectFilter, inDeprecatedFilter)
	} else {
		statement = fmt.Sprintf(`DELETE FROM environments
			WHERE key = $1
			AND project IN %s
			AND deprecated IN %s
			RETURNING key;`, inProjectFilter, inDeprecatedFilter)
	}

	deleteEnv, err := db.PrepareContext(ctx, statement)
	if err != nil {
		panic(err)
	}
	defer deleteEnv.Close()

	var rows *sql.Rows
	rows, err = deleteEnv.QueryContext(ctx, key, PROJECT.Value())
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	for rows.Next() {
		var key string
		err = rows.Scan(&key)
		if err != nil {
			panic(err)
		}

		if isDebugEnabled {
			slog.InfoContext(ctx, "delete", "env", key)
		}

		delete(ENVS, key)
	}

	if isDebugEnabled {
		slog.InfoContext(ctx, "delete", "env", key, "project", PROJECT.Value(), "withGlobal", withGlobal)
	}
}

func SetEnv(ctx context.Context, db *sql.DB, key string, value string, isGlobal bool) {
	isDebugEnabled := ctx.Value(ContextKeyDebug).(bool)

	tx, err := db.Begin()
	if err != nil {
		panic(err)
	}

	deprecate, err := tx.PrepareContext(ctx, "UPDATE environments SET deprecated = 1 WHERE key = $1 AND project = $2;")
	if err != nil {
		panic(err)
	}
	defer deprecate.Close()

	var project string
	if isGlobal {
		project = "*"
	} else {
		project = PROJECT.Value()
	}

	result, err := deprecate.ExecContext(ctx, key, project)
	if err != nil {
		panic(err)
	}

	if isDebugEnabled {
		rowsAffected, _ := result.RowsAffected()

		slog.InfoContext(ctx, "deprecated", "affected", rowsAffected)
		slog.InfoContext(ctx, "deprecate", "env", key, "project", PROJECT.Value())
	}

	insert, err := tx.PrepareContext(ctx, `INSERT INTO environments(uuid, key, value, project, deprecated)
		VALUES($1, $2, $3, $4, 0);`)
	if err != nil {
		panic(err)
	}
	defer insert.Close()

	uuid, _ := uuid.NewV7()
	result, err = insert.ExecContext(ctx, uuid, key, encrypt(value, ENCRYPTION_KEY.Value()), project)
	if err != nil {
		panic(err)
	}

	if isDebugEnabled {
		rowsAffected, _ := result.RowsAffected()

		slog.InfoContext(ctx, "insert", "affected", rowsAffected)
		slog.InfoContext(ctx, "insert", "env", key, "project", PROJECT.Value())
	}

	err = tx.Commit()
	if err != nil {
		panic(err)
	}

	ENVS[key] = value
	os.Setenv(key, value)
}

func PruneEnv(ctx context.Context, db *sql.DB, offset int, withGlobal bool) {
	isDebugEnabled := ctx.Value(ContextKeyDebug).(bool)

	prune, err := db.PrepareContext(ctx, `DELETE FROM environments 
		WHERE uuid 
		IN (
			SELECT uuid 
			FROM environments 
			WHERE project = $1 AND deprecated = 1
			ORDER BY uuid DESC
			LIMIT $2
			OFFSET $3);`)
	if err != nil {
		panic(err)
	}
	defer prune.Close()

	var project string
	if withGlobal {
		project = "*"
	} else {
		project = PROJECT.Value()
	}

	var result sql.Result
	if DB_DRIVER.Value() == "sqlite3" {
		result, err = prune.ExecContext(ctx, project, "-1", offset)
		if err != nil {
			panic(err)
		}
	} else if DB_DRIVER.Value() == "pgx" {
		result, err = prune.ExecContext(ctx, project, nil, offset)
		if err != nil {
			panic(err)
		}
	}

	if isDebugEnabled {
		rowsAffected, _ := result.RowsAffected()

		slog.InfoContext(ctx, "prune", "affected", rowsAffected)
		slog.InfoContext(ctx, "prune", "offset", offset, "project", PROJECT.Value(), "withGlobal", withGlobal)
	}
}

func ClearEnv(ctx context.Context, db *sql.DB, offset int, withGlobal bool) {
	isDebugEnabled := ctx.Value(ContextKeyDebug).(bool)

	prune, err := db.PrepareContext(ctx, `DELETE FROM environments 
		WHERE uuid
		IN (
			SELECT uuid
			FROM environments
			WHERE project = $1
			ORDER BY uuid DESC
			LIMIT $2
			OFFSET $3)
		RETURNING key;`)
	if err != nil {
		panic(err)
	}
	defer prune.Close()

	var project string
	if withGlobal {
		project = "*"
	} else {
		project = PROJECT.Value()
	}

	var rows *sql.Rows
	if DB_DRIVER.Value() == "sqlite3" {
		rows, err = prune.QueryContext(ctx, project, "-1", offset)
		if err != nil {
			panic(err)
		}
	} else if DB_DRIVER.Value() == "pgx" {
		rows, err = prune.QueryContext(ctx, project, nil, offset)
		if err != nil {
			panic(err)
		}
	}
	defer rows.Close()

	for rows.Next() {
		var key string
		err = rows.Scan(&key)
		if err != nil {
			panic(err)
		}

		if isDebugEnabled {
			slog.InfoContext(ctx, "clear", "env", key)
		}

		delete(ENVS, key)
	}

	err = rows.Err()
	if err != nil {
		panic(err)
	}

	if isDebugEnabled {
		slog.InfoContext(ctx, "clear", "offset", offset, "project", PROJECT.Value(), "withGlobal", withGlobal)
	}
}

func Open(ctx context.Context) (db *sql.DB, close func() error) {
	isDebugEnabled := ctx.Value(ContextKeyDebug).(bool)

	db, err := sql.Open(DB_DRIVER.Value(), DB_CONNECTION_STRING.Value())
	if err != nil {
		panic(err)
	}

	createTable := `CREATE TABLE IF NOT EXISTS environments (
		uuid TEXT NOT NULL,
		key TEXT NOT NULL,
		value TEXT NOT NULL,
		project TEXT NOT NULL,
		deprecated INTEGER);`
	_, err = db.ExecContext(ctx, createTable)
	if err != nil {
		panic(err)
	}

	if isDebugEnabled {
		slog.InfoContext(ctx, "create", "table", "environments", "project", PROJECT.Value())
	}

	return db, db.Close
}

// From: https://www.melvinvivas.com/how-to-encrypt-and-decrypt-data-using-aes
func encrypt(plain string, key string) (encrypted string) {
	decodedKey, _ := hex.DecodeString(key)

	block, err := aes.NewCipher(decodedKey)
	if err != nil {
		panic(err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		panic(err)
	}

	nonce := make([]byte, gcm.NonceSize())
	rand.Read(nonce)

	sealed := gcm.Seal(nonce, nonce, []byte(plain), nil)

	return fmt.Sprintf("%x", sealed)
}

func decrypt(encrypted string, key string) (plain string) {
	decodedKey, _ := hex.DecodeString(key)

	decoded, err := hex.DecodeString(encrypted)
	if err != nil {
		panic(err)
	}

	block, err := aes.NewCipher(decodedKey)
	if err != nil {
		panic(err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		panic(err)
	}

	nonce := decoded[:gcm.NonceSize()]
	data := decoded[gcm.NonceSize():]

	bytes, err := gcm.Open(nil, nonce, data, nil)
	if err != nil {
		panic(err)
	}

	return string(bytes)
}
