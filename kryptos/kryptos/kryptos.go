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
	"path/filepath"
	"runtime"

	"github.com/dogmatiq/ferrite"
	"github.com/elliotchance/orderedmap/v2"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database"
	"github.com/golang-migrate/migrate/v4/database/pgx"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/google/uuid"
	_ "github.com/jackc/pgx/v5/stdlib"
	_ "github.com/mattn/go-sqlite3"
)

type contextKey string

var (
	PROJECT_ENV              = "PROJECT"
	DB_DRIVER_ENV            = "DB_DRIVER"
	DB_CONNECTION_STRING_ENV = "DB_CONNECTION_STRING"
	ENCRYPTION_KEY_ENV       = "ENCRYPTION_KEY"
)

var (
	ContextKeyDebug = contextKey("debug")
	VERSION         = "0.0.1"
	PROJECT         = ferrite.
			String(PROJECT_ENV, "Project to load environments for").
			WithDefault("*").
			Required()
	DB_DRIVER = ferrite.
			Enum(DB_DRIVER_ENV, "Database driver").
			WithMembers("sqlite3", "pgx").
			WithDefault("sqlite3").
			Required()
	DB_CONNECTION_STRING = ferrite.
				String(DB_CONNECTION_STRING_ENV, "Database connection string").
				Required()
	ENCRYPTION_KEY = ferrite.
			String(ENCRYPTION_KEY_ENV, "32 byte encryption key, `openssl rand -hex 32`").
			Required()
)

var ENVS = orderedmap.NewOrderedMap[string, string]()

type envStat struct {
	Key     string
	Project string
	Count   int
}

func Stats(ctx context.Context, db *sql.DB) ([]envStat, error) {
	rows, err := db.QueryContext(ctx, `WITH 
		project_environments AS (SELECT key, project 
			FROM environments
			WHERE project = $1),
		global_environments AS (SELECT key, project
			FROM environments
			WHERE project = '*'),
		scoped_environments AS (SELECT key, project
			FROM project_environments
			UNION ALL
			SELECT key, project
			FROM global_environments
			WHERE NOT EXISTS(SELECT * FROM project_environments WHERE project_environments.key = global_environments.key)),
		counts AS (SELECT key, COUNT(key)
			FROM scoped_environments
			GROUP BY key)
		
		SELECT DISTINCT counts.key, scoped_environments.project, counts.count FROM counts
		INNER JOIN scoped_environments
		ON scoped_environments.key = counts.key
		ORDER BY counts.key COLLATE NOCASE;
	`, PROJECT.Value())
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	envs := []envStat{}

	for rows.Next() {
		var key string
		var project string
		var count int
		err = rows.Scan(&key, &project, &count)
		if err != nil {
			return nil, err
		}

		envStat := envStat{
			Key:     key,
			Project: project,
			Count:   count,
		}

		envs = append(envs, envStat)
	}

	err = rows.Err()
	if err != nil {
		return nil, err
	}

	return envs, nil
}

func GetEnvs(ctx context.Context, db *sql.DB) error {
	isDebugEnabled := ctx.Value(ContextKeyDebug).(bool)

	query := `WITH 
		project_environments AS (SELECT key, value 
			FROM environments
			WHERE deprecated = 0 AND project = $1),
		global_environments AS (SELECT key, value
			FROM environments
			WHERE deprecated = 0 AND project = '*')

		SELECT key, value
		FROM project_environments
		UNION ALL
		SELECT key, value
		FROM global_environments
		WHERE NOT EXISTS(SELECT * FROM project_environments WHERE project_environments.key = global_environments.key)`

	if DB_DRIVER.Value() == "sqlite3" {
		queryWithSort := fmt.Sprintf(`%s ORDER BY key COLLATE NOCASE;`, query)

		query = queryWithSort
	} else if DB_DRIVER.Value() == "pgx" {
		queryWithSort := fmt.Sprintf("%s ORDER BY LOWER(key), key;", query)

		query = queryWithSort
	}

	envs, err := db.PrepareContext(ctx, query)
	if err != nil {
		return err
	}
	defer envs.Close()

	rows, err := envs.QueryContext(ctx, PROJECT.Value())
	if err != nil {
		return err
	}
	defer rows.Close()

	ENVS = orderedmap.NewOrderedMap[string, string]()
	for rows.Next() {
		var key string
		var encrypted string
		err = rows.Scan(&key, &encrypted)
		if err != nil {
			return err
		}

		if isDebugEnabled {
			slog.InfoContext(ctx, "get", "env", key)
		}

		decrypted, err := decrypt(encrypted, ENCRYPTION_KEY.Value())
		if err != nil {
			return err
		}

		if isDebugEnabled {
			slog.InfoContext(ctx, "decrypt", "env", key)
		}

		ENVS.Set(key, decrypted)
	}

	err = rows.Err()
	if err != nil {
		return err
	}

	return nil
}

func DeleteEnv(ctx context.Context, db *sql.DB, key string, includeDeprecated bool, includeGlobal bool) error {
	isDebugEnabled := ctx.Value(ContextKeyDebug).(bool)

	inProjectFilter := ""
	if includeGlobal {
		inProjectFilter = "($2, '*')"
	} else {
		inProjectFilter = "($2)"
	}

	inDeprecatedFilter := ""
	if includeDeprecated {
		inDeprecatedFilter = "(0, 1)"
	} else {
		inDeprecatedFilter = "(0)"
	}

	statement := fmt.Sprintf(`DELETE FROM environments
		WHERE key = $1
		AND project IN %s
		AND deprecated IN %s
		RETURNING key;`, inProjectFilter, inDeprecatedFilter)

	deleteEnv, err := db.PrepareContext(ctx, statement)
	if err != nil {
		return err
	}
	defer deleteEnv.Close()

	var rows *sql.Rows
	rows, err = deleteEnv.QueryContext(ctx, key, PROJECT.Value())
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var key string
		err = rows.Scan(&key)
		if err != nil {
			return err
		}

		if isDebugEnabled {
			slog.InfoContext(ctx, "delete", "env", key)
		}

		ENVS.Delete(key)
	}

	if isDebugEnabled {
		slog.InfoContext(ctx, "delete", "env", key, "project", PROJECT.Value(), "includeGlobal", includeGlobal)
	}

	return nil
}

func SetEnv(ctx context.Context, db *sql.DB, key string, value string, isGlobal bool) error {
	isDebugEnabled := ctx.Value(ContextKeyDebug).(bool)

	tx, err := db.Begin()
	if err != nil {
		return err
	}

	deprecate, err := tx.PrepareContext(ctx, "UPDATE environments SET deprecated = 1 WHERE key = $1 AND project = $2;")
	if err != nil {
		return err
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
		return err
	}

	if isDebugEnabled {
		rowsAffected, _ := result.RowsAffected()

		slog.InfoContext(ctx, "deprecated", "affected", rowsAffected)
		slog.InfoContext(ctx, "deprecate", "env", key, "project", PROJECT.Value())
	}

	insert, err := tx.PrepareContext(ctx, `INSERT INTO environments(uuid, key, value, project, deprecated)
		VALUES($1, $2, $3, $4, 0);`)
	if err != nil {
		return err
	}
	defer insert.Close()

	uuid, _ := uuid.NewV7()
	encrypted, err := encrypt(value, ENCRYPTION_KEY.Value())
	if err != nil {
		return err
	}
	result, err = insert.ExecContext(ctx, uuid, key, encrypted, project)
	if err != nil {
		return err
	}

	if isDebugEnabled {
		rowsAffected, _ := result.RowsAffected()

		slog.InfoContext(ctx, "insert", "affected", rowsAffected)
		slog.InfoContext(ctx, "insert", "env", key, "project", PROJECT.Value())
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	_, ok := ENVS.Get(key)
	if project == "*" && PROJECT.Value() != "*" && ok {
		find, err := db.PrepareContext(ctx, "SELECT uuid FROM environments WHERE key = $1 AND project = $2 AND deprecated = 0;")
		if err != nil {
			return err
		}

		rows, err := find.QueryContext(ctx, key, PROJECT.Value())
		if err != nil {
			return err
		}

		if rows.Next() {
			return nil
		}
	}

	ENVS.Set(key, value)
	os.Setenv(key, value)

	return nil
}

func Rename(ctx context.Context, db *sql.DB, previous string, next string, isGlobal bool, isProject bool) error {
	isDebugEnabled := ctx.Value(ContextKeyDebug).(bool)

	projectStatement := "UPDATE environments SET project = $1 WHERE project = $2 AND project != '*';"
	environmentStatement := "UPDATE environments SET key = $1 WHERE key = $2 AND project = $3;"

	statement := ""
	if isProject {
		statement = projectStatement
	} else {
		statement = environmentStatement
	}

	project := PROJECT.Value()
	if isGlobal && !isProject {
		project = "*"
	}

	mv, err := db.PrepareContext(ctx, statement)
	if err != nil {
		return err
	}
	defer mv.Close()

	rows, err := mv.QueryContext(ctx, next, previous, project)
	if err != nil {
		return err
	}
	defer rows.Close()

	if !isProject {
		value, _ := ENVS.Get(previous)

		ENVS.Delete(previous)

		ENVS.Set(next, value)
	}

	if isDebugEnabled {
		slog.InfoContext(ctx, "rename", "previous", previous, "next", next, "isProject", isProject)
	}

	return nil
}

func PruneEnv(ctx context.Context, db *sql.DB, offset int, withGlobal bool) error {
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
		return err
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
			return err
		}
	} else if DB_DRIVER.Value() == "pgx" {
		rows, err = prune.QueryContext(ctx, project, nil, offset)
		if err != nil {
			return err
		}
	}

	for rows.Next() {
		var key string
		err = rows.Scan(&key)
		if err != nil {
			return err
		}

		if isDebugEnabled {
			slog.InfoContext(ctx, "prune", "env", key)
		}

		ENVS.Delete(key)
	}

	if isDebugEnabled {
		slog.InfoContext(ctx, "prune", "offset", offset, "project", PROJECT.Value(), "withGlobal", withGlobal)
	}

	return nil
}

func ClearEnv(ctx context.Context, db *sql.DB, offset int, withGlobal bool) error {
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
		return err
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
			return err
		}
	} else if DB_DRIVER.Value() == "pgx" {
		rows, err = prune.QueryContext(ctx, project, nil, offset)
		if err != nil {
			return err
		}
	}
	defer rows.Close()

	for rows.Next() {
		var key string
		err = rows.Scan(&key)
		if err != nil {
			return err
		}

		if isDebugEnabled {
			slog.InfoContext(ctx, "clear", "env", key)
		}

		ENVS.Delete(key)
	}

	err = rows.Err()
	if err != nil {
		return err
	}

	if isDebugEnabled {
		slog.InfoContext(ctx, "clear", "offset", offset, "project", PROJECT.Value(), "withGlobal", withGlobal)
	}

	return err
}

func Open(ctx context.Context) (*sql.DB, func() error, error) {
	isDebugEnabled := ctx.Value(ContextKeyDebug).(bool)

	db, err := sql.Open(DB_DRIVER.Value(), DB_CONNECTION_STRING.Value())
	if err != nil {
		return nil, nil, err
	}

	var driver database.Driver
	if DB_DRIVER.Value() == "sqlite3" {
		driver, err = sqlite3.WithInstance(db, &sqlite3.Config{})
		if err != nil {
			return nil, nil, err
		}
	} else if DB_DRIVER.Value() == "pgx" {
		driver, err = pgx.WithInstance(db, &pgx.Config{})
		if err != nil {
			return nil, nil, err
		}
	}

	_, basePath, _, _ := runtime.Caller(0)
	rootDirectory := filepath.Dir(basePath)

	path, _ := filepath.Abs(fmt.Sprintf("%s/../migrations", rootDirectory))
	m, err := migrate.NewWithDatabaseInstance(fmt.Sprintf("file://%s", path), "kryptos", driver)
	if err != nil {
		return nil, nil, err
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return nil, nil, err
	}

	if isDebugEnabled {
		slog.InfoContext(ctx, "create", "table", "environments", "project", PROJECT.Value())
	}

	return db, db.Close, nil
}

// From: https://www.melvinvivas.com/how-to-encrypt-and-decrypt-data-using-aes
func encrypt(plain string, key string) (string, error) {
	decodedKey, _ := hex.DecodeString(key)

	block, err := aes.NewCipher(decodedKey)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, gcm.NonceSize())
	rand.Read(nonce)

	sealed := gcm.Seal(nonce, nonce, []byte(plain), nil)

	return fmt.Sprintf("%x", sealed), nil
}

func decrypt(encrypted string, key string) (string, error) {
	decodedKey, _ := hex.DecodeString(key)

	decoded, err := hex.DecodeString(encrypted)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(decodedKey)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := decoded[:gcm.NonceSize()]
	data := decoded[gcm.NonceSize():]

	bytes, err := gcm.Open(nil, nonce, data, nil)
	if err != nil {
		return "", err
	}

	return string(bytes), nil
}
