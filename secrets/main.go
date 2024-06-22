package main

import (
	"context"
	"fmt"
	"os"
	"skulpture/secrets/kryptos"

	"github.com/docopt/docopt-go"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	usage := `Kryptos

Usage:
    kryptos set <key> <value> [-d | --debug] [-g | --global]
    kryptos (rm|grep) <key> [-d | --debug] [-a | --all]
    kryptos rotate (-e <encryption> | --encryption-key=<encryption>) [-d | --debug]
    kryptos cat
    kryptos dump [-o <output> | --output=<output>]
    kryptos prune <offset> [-d | --debug] [-a | --all] [-g | --global]
    kryptos info
    kryptos -h | --help
    kryptos -v | --version

Description:
    Manages environment variables
    Environment variables are encrypted and versioned

    Supported database drivers: sqlite3, postgres

Command reference:
    set     Set an environment variable
    rm      Remove an environment variable
    grep    Get the value of an environment variable
    rotate  Change the encryption key used
    cat     List all environment variables
    dump    Print all environment variables to a file
    prune   Delete all environment variables linked to a project
    info    Kryptos information

Options:
    -o --output=<output>              Output file [default: ./.env]
    -e --encryption-key=<encryption>  Encryption key
    -d --debug                        Enable debug logs [default: false]
    -a --all                          Include current variables
	-g --global                       Include global variables [default: false]
    -h --help                         Show this screen
    -v --version                      Show version

"Try to understand the fuckin' message I encrypted"`

	options, err := docopt.ParseArgs(usage, nil, kryptos.VERSION)
	if err != nil {
		panic(err)
	}

	debug, _ := options.Bool("--debug")
	ctx := context.WithValue(context.Background(), kryptos.ContextKeyDebug, debug)

	db, close := kryptos.Open(ctx)
	defer close()

	kryptos.GetEnvs(ctx, db)

	set, _ := options.Bool("set")
	rm, _ := options.Bool("rm")
	grep, _ := options.Bool("grep")
	rotate, _ := options.Bool("rotate")
	cat, _ := options.Bool("cat")
	dump, _ := options.Bool("dump")
	prune, _ := options.Bool("prune")
	info, _ := options.Bool("info")

	if set {
		key, _ := options.String("<key>")
		value, _ := options.String("<value>")
		isGlobal, _ := options.Bool("--global")

		kryptos.SetEnv(ctx, db, key, value, isGlobal)
	} else if rm {
		all, _ := options.Bool("--all")
		key, _ := options.String("<key>")

		kryptos.DeleteEnv(ctx, db, key, all)
	} else if grep {
		key, _ := options.String("<key>")

		fmt.Println(kryptos.ENVS[key])
	} else if rotate {
		encryptionKey, _ := options.String("--encryption-key")

		os.Setenv("ENCRYPTION_KEY", encryptionKey)

		for key, value := range kryptos.ENVS {
			kryptos.SetEnv(ctx, db, key, value, false)
		}
	} else if cat {
		// eval $(kryptos cat)
		for key, value := range kryptos.ENVS {
			fmt.Printf("%s=%s\n", key, value)
		}
	} else if dump {
		path, _ := options.String("--output")

		out := ""

		for key, value := range kryptos.ENVS {
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
	} else if prune {
		offset, _ := options.Int("<offset>")
		all, _ := options.Bool("--all")
		isGlobal, _ := options.Bool("--global")

		if !all {
			kryptos.PruneEnv(ctx, db, offset, isGlobal)
		} else {
			kryptos.ClearEnv(ctx, db, offset, isGlobal)
		}
	} else if info {
		fmt.Printf("Project: %s\n", kryptos.PROJECT.Value())
		fmt.Printf("Database driver: %s\n", kryptos.DB_DRIVER.Value())
		fmt.Printf("Database connection string: %s\n", kryptos.DB_CONNECTION_STRING.Value())
		fmt.Printf("Encryption key: %s\n", kryptos.ENCRYPTION_KEY.Value())
		fmt.Printf("Version: v%s\n", kryptos.VERSION)
	}
}
