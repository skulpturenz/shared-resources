package main

import (
	"context"
	"skulpture/secrets/commands"
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

		setEnvCommand := commands.SetEnv{
			Ctx:      ctx,
			Db:       db,
			Key:      key,
			Value:    value,
			IsGlobal: isGlobal,
		}

		setEnvCommand.Execute()
	} else if rm {
		all, _ := options.Bool("--all")
		key, _ := options.String("<key>")

		rmCommand := commands.Rm{
			Ctx:       ctx,
			Db:        db,
			Key:       key,
			DeleteAll: all,
		}

		rmCommand.Execute()
	} else if grep {
		key, _ := options.String("<key>")

		grepCommand := commands.Grep{
			Key: key,
		}

		grepCommand.Execute()
	} else if rotate {
		encryptionKey, _ := options.String("--encryption-key")

		rotateCommand := commands.Rotate{
			Ctx:           ctx,
			Db:            db,
			EncryptionKey: encryptionKey,
		}

		rotateCommand.Execute()
	} else if cat {
		catCommand := commands.Cat{}

		catCommand.Execute()
	} else if dump {
		path, _ := options.String("--output")

		dumpCommand := commands.Dump{
			Path: path,
		}

		dumpCommand.Execute()
	} else if prune {
		offset, _ := options.Int("<offset>")
		all, _ := options.Bool("--all")
		isGlobal, _ := options.Bool("--global")

		pruneCommand := commands.Prune{
			Ctx:            ctx,
			Db:             db,
			Offset:         offset,
			IncludeCurrent: all,
			PruneGlobal:    isGlobal,
		}

		pruneCommand.Execute()
	} else if info {
		infoCommand := commands.Info{}

		infoCommand.Execute()
	}
}
