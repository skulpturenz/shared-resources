package main

import (
	"database/sql"
	"log/slog"
	"os"

	"github.com/dogmatiq/ferrite"
	_ "github.com/mattn/go-sqlite3"
)

var (
	DSN = ferrite.
		String("DSN", "SQLite connection string").
		Required()
)

func init() {
	db, err := sql.Open("sqlite3", DSN.Value())
	if err != nil {
		panic(err)
	}
	defer db.Close()

	rows, err := db.Query("SELECT key, value FROM secrets WHERE deprecated = 0;")
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	for rows.Next() {
		var key string
		var value string
		err = rows.Scan(&key, &value)

		os.Setenv(key, value)
		if err != nil {
			panic(err)
		}

		slog.Info("loaded", "env", key)
	}

	err = rows.Err()
	if err != nil {
		panic(err)
	}
}
