package commands_test

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"os"
	"testing"

	embeddedpostgres "github.com/fergusstrange/embedded-postgres"
)

var DBs = map[string]func(t *testing.T) func() error{
	// "pgx":     initPgxEnv,
	"sqlite3": initSqlite3Env,
}

func init() {
	envs := []string{
		"PROJECT",
		"DB_DRIVER",
		"DB_CONNECTION_STRING",
		"ENCRYPTION_KEY",
	}

	for _, env := range envs {
		if _, isPresent := os.LookupEnv(env); isPresent {
			log.Fatalf("expected env `%s` to not be present", env)
		}
	}
}

func initPgxEnv(t *testing.T) func() error {
	database := embeddedpostgres.NewDatabase(embeddedpostgres.DefaultConfig().
		CachePath("./.pg-go").
		RuntimePath("./.pg-go/extracted").
		DataPath("./.pg-go/extracted/data").
		BinariesPath("./.pg-go/extracted"))
	err := database.Start()
	if err != nil {
		t.Fatal(err)
	}

	t.Setenv("PROJECT", "test")
	t.Setenv("DB_DRIVER", "pgx")
	t.Setenv("DB_CONNECTION_STRING", "postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable")

	encryptionKey, _ := randomHex(32)
	t.Setenv("ENCRYPTION_KEY", encryptionKey)

	return database.Stop
}

func initSqlite3Env(t *testing.T) func() error {
	t.Setenv("PROJECT", "test")
	t.Setenv("DB_DRIVER", "sqlite3")
	t.Setenv("DB_CONNECTION_STRING", "file:test2.db?mode=memory")

	encryptionKey, _ := randomHex(32)
	t.Setenv("ENCRYPTION_KEY", encryptionKey)

	return func() error {
		return nil
	}
}

func randomHex(n int) (string, error) {
	bytes := make([]byte, n)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}

	return hex.EncodeToString(bytes), nil
}
