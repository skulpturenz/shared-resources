package main

import (
	"fmt"
	"os"
	"skulpture/secrets/kryptos"

	"github.com/docopt/docopt-go"
	_ "github.com/mattn/go-sqlite3"
)

var ENVS = map[string]string{}

func init() {
	db, close := kryptos.Open()
	defer close()

	kryptos.GetEnvs(db)

	for key, value := range ENVS {
		os.Setenv(key, value)
	}
}

func main() {
	usage := `Kryptos

Usage:
    kryptos set <key> <value>
    kryptos (rm|grep) <key>
	kryptos refresh (-e <encryption> | --encryption-key=<encryption>)
    kryptos cat
    kryptos dump [-o <output> | --output=<output>]
	kryptos info
    kryptos -h | --help
    kryptos -v | --version

Options:
    -o --output=<output>              Output file [default: ./.env]
	-e --encryption-key=<encryption>  Encryption key
    -h --help                         Show this screen
    -v --version                      Show version

"Try to understand the fuckin' message I encrypted"`

	options, err := docopt.ParseArgs(usage, nil, kryptos.VERSION)
	if err != nil {
		panic(err)
	}

	db, close := kryptos.Open()
	defer close()

	kryptos.GetEnvs(db)

	set, _ := options.Bool("set")
	rm, _ := options.Bool("rm")
	grep, _ := options.Bool("grep")
	refresh, _ := options.Bool("refresh")
	cat, _ := options.Bool("cat")
	dump, _ := options.Bool("dump")
	info, _ := options.Bool("info")

	if set {
		key, _ := options.String("<key>")
		value, _ := options.String("<value>")

		kryptos.SetEnv(db, key, value)
	} else if rm {
		key, _ := options.String("<key>")

		kryptos.DeleteEnv(db, key)
	} else if grep {
		key, _ := options.String("<key>")

		fmt.Println(ENVS[key])
	} else if refresh {
		encryptionKey, _ := options.String("--encryption-key")

		os.Setenv("ENCRYPTION_KEY", encryptionKey)

		for key, value := range ENVS {
			kryptos.SetEnv(db, key, value)
		}
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
		fmt.Printf("Project: %s\n", kryptos.PROJECT.Value())
		fmt.Printf("DSN: %s\n", kryptos.DSN.Value())
		fmt.Printf("Encryption key: %s\n", kryptos.KEY.Value())
		fmt.Printf("Version: v%s\n", kryptos.VERSION)
	}
}
