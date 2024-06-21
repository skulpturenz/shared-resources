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
	KEY = ferrite.
		String("ENCRYPTION_KEY", "32 byte encryption key, `openssl rand -hex 16`").
		Required()
)

var ENVS = map[string]string{}

func init() {
	ctx := context.WithValue(context.Background(), ContextKeyDebug, false)

	db, close := Open(ctx)
	defer close()

	GetEnvs(ctx, db)

	for key, value := range ENVS {
		os.Setenv(key, value)
	}
}

func GetEnvs(ctx context.Context, db *sql.DB) {
	isDebugEnabled := ctx.Value(ContextKeyDebug).(bool)

	envs, err := db.PrepareContext(ctx, `SELECT key, value 
		FROM environments
		WHERE deprecated = 0 AND (project = ? OR project = '*');`)
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

		decrypted := decrypt(encrypted, KEY.Value())

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

func DeleteEnv(ctx context.Context, db *sql.DB, key string) {
	isDebugEnabled := ctx.Value(ContextKeyDebug).(bool)

	deleteEnv, err := db.PrepareContext(ctx, "DELETE FROM environments WHERE key = ? AND project = ?;")
	if err != nil {
		panic(err)
	}
	defer deleteEnv.Close()

	_, err = deleteEnv.ExecContext(ctx, key, PROJECT.Value())
	if err != nil {
		panic(err)
	}

	delete(ENVS, key)

	if isDebugEnabled {
		slog.InfoContext(ctx, "delete", "env", key, "project", PROJECT.Value())
	}
}

func SetEnv(ctx context.Context, db *sql.DB, key string, value string) {
	isDebugEnabled := ctx.Value(ContextKeyDebug).(bool)

	tx, err := db.Begin()
	if err != nil {
		panic(err)
	}

	deprecate, err := tx.PrepareContext(ctx, "UPDATE environments SET deprecated = 1 WHERE key = ? AND project = ?;")
	if err != nil {
		panic(err)
	}
	defer deprecate.Close()

	_, err = deprecate.ExecContext(ctx, key, PROJECT.Value())
	if err != nil {
		panic(err)
	}

	if isDebugEnabled {
		slog.InfoContext(ctx, "deprecate", "env", key, "project", PROJECT.Value())
	}

	insert, err := tx.PrepareContext(ctx, "INSERT INTO environments(key, value, project, deprecated) VALUES(?, ?, ?, 0);")
	if err != nil {
		panic(err)
	}
	defer insert.Close()

	_, err = insert.ExecContext(ctx, key, encrypt(value, KEY.Value()), PROJECT.Value())
	if err != nil {
		panic(err)
	}

	if isDebugEnabled {
		slog.InfoContext(ctx, "insert", "env", key, "project", PROJECT.Value())
	}

	ENVS[key] = value

	err = tx.Commit()
	if err != nil {
		panic(err)
	}
}

func PruneEnv(ctx context.Context, db *sql.DB, offset int) {
	isDebugEnabled := ctx.Value(ContextKeyDebug).(bool)

	prune, err := db.PrepareContext(ctx, `DELETE FROM environments 
		WHERE id 
		IN (
			SELECT id 
			FROM environments 
			WHERE project = ? AND deprecated = 1
			ORDER BY id DESC OFFSET ?)`)
	if err != nil {
		panic(err)
	}
	prune.Close()

	_, err = prune.ExecContext(ctx, PROJECT.Value(), offset)
	if err != nil {
		panic(err)
	}

	if isDebugEnabled {
		slog.InfoContext(ctx, "prune", "offset", offset, "project", PROJECT.Value())
	}
}

func Open(ctx context.Context) (db *sql.DB, close func() error) {
	isDebugEnabled := ctx.Value(ContextKeyDebug).(bool)

	db, err := sql.Open(DB_DRIVER.Value(), DB_CONNECTION_STRING.Value())
	if err != nil {
		panic(err)
	}

	createTable := `CREATE TABLE IF NOT EXISTS environments (
		id INTEGER AUTO INCREMENT,
		key TEXT,
		value TEXT,
		project TEXT,
		deprecated INTEGER,
		PRIMARY KEY(id, key, project));`
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
	block, err := aes.NewCipher([]byte(key))
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
	decoded, err := hex.DecodeString(encrypted)
	if err != nil {
		panic(err)
	}

	block, err := aes.NewCipher([]byte(key))
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
