package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"fmt"
	"os"

	"github.com/docopt/docopt-go"
	"github.com/dogmatiq/ferrite"
	_ "github.com/mattn/go-sqlite3"
)

var (
	VERSION = "0.0.1"
	PROJECT = ferrite.
		String("PROJECT", "Project to load environments for").
		WithDefault("*").
		Required()
	DSN = ferrite.
		String("DSN", "SQLite connection string").
		Required()
	KEY = ferrite.
		String("ENCRYPTION_KEY", "32 byte encryption key, `openssl rand -hex 16`").
		Required()
)

var ENVS = map[string]string{}

func init() {
	db, close := open()
	defer close()

	GetEnvs(db)

	for key, value := range ENVS {
		os.Setenv(key, value)
	}
}

func main() {
	usage := `Kryptos

Usage:
    kryptos set <key> <value>
    kryptos (rm|grep) <key>
    kryptos cat
    kryptos dump [-o <output> | --output=<output>]
	kryptos info
    kryptos -h | --help
    kryptos --version

Options:
    -h --help             Show this screen
    --version             Show version
    -o --output=<output>  Output file [default: ./.env]`

	options, err := docopt.ParseArgs(usage, nil, VERSION)
	if err != nil {
		panic(err)
	}

	db, close := open()
	defer close()

	GetEnvs(db)

	set, _ := options.Bool("set")
	rm, _ := options.Bool("rm")
	grep, _ := options.Bool("grep")
	cat, _ := options.Bool("cat")
	dump, _ := options.Bool("dump")
	info, _ := options.Bool("info")

	if set {
		key, _ := options.String("<key>")
		value, _ := options.String("<value>")

		SetEnv(db, key, value)
	} else if rm {
		key, _ := options.String("<key>")

		DeleteEnv(db, key)
	} else if grep {
		key, _ := options.String("<key>")

		fmt.Println(ENVS[key])
	} else if cat {
		// eval $(kryptos cat)
		for key, value := range ENVS {
			fmt.Printf("%s=%s\n", key, value)
		}
	} else if dump {
		path, _ := options.String("--output")

		out := ""

		for key, value := range ENVS {
			out += fmt.Sprintf("%s=%s\n", key, value)
		}

		file, err := os.Create(path)
		if err != nil {
			panic(err)
		}
		defer file.Close()

		_, err = file.WriteString(out)
		if err != nil {
			panic(err)
		}

		file.Sync()
	} else if info {
		fmt.Printf("Project: %s\n", PROJECT.Value())
		fmt.Printf("DSN: %s\n", DSN.Value())
		fmt.Printf("Encryption key: %s\n", KEY.Value())
		fmt.Printf("Version: v%s\n", VERSION)
	}
}

func GetEnvs(db *sql.DB) {
	rows, err := db.Query(fmt.Sprintf(`SELECT 
		key, value 
	FROM
		environments
	WHERE 
		deprecated = 0 AND 
		(project = '%s' OR project = '*');`, PROJECT.Value()))
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

		decrypted := decrypt(encrypted, KEY.Value())
		ENVS[key] = decrypted
	}

	err = rows.Err()
	if err != nil {
		panic(err)
	}
}

func DeleteEnv(db *sql.DB, key string) {
	statement, err := db.Prepare("DELETE FROM environments WHERE key = ? AND project = ?;")
	if err != nil {
		panic(err)
	}
	defer statement.Close()

	_, err = statement.Exec(key, PROJECT.Value())
	if err != nil {
		panic(err)
	}

	delete(ENVS, key)
}

func SetEnv(db *sql.DB, key string, value string) {
	tx, err := db.Begin()
	if err != nil {
		panic(err)
	}

	deprecate, err := tx.Prepare("UPDATE environments SET deprecated = 1 WHERE key = ? AND project = ?;")
	if err != nil {
		panic(err)
	}
	defer deprecate.Close()

	_, err = deprecate.Exec(key, PROJECT.Value())
	if err != nil {
		panic(err)
	}

	insert, err := tx.Prepare("INSERT INTO environments(key, value, project, deprecated) VALUES(?, ?, ?, 0);")
	if err != nil {
		panic(err)
	}
	defer insert.Close()

	_, err = insert.Exec(key, encrypt(value, KEY.Value()), PROJECT.Value())
	if err != nil {
		panic(err)
	}

	ENVS[key] = value

	err = tx.Commit()
	if err != nil {
		panic(err)
	}
}

func open() (db *sql.DB, close func() error) {
	db, err := sql.Open("sqlite3", DSN.Value())
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
	_, err = db.Exec(createTable)
	if err != nil {
		panic(err)
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
