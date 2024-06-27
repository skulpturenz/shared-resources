package main

import (
	"context"
	"os"
	"skulpture/kryptos/commands"
	"skulpture/kryptos/kryptos"

	"github.com/docopt/docopt-go"
	"github.com/dogmatiq/ferrite"
	"github.com/joho/godotenv"
	_ "github.com/mattn/go-sqlite3"
)

var (
	ENV_FILE_PATH = ferrite.
			String("ENV_FILE_PATH", "Load environment from file at path").
			Optional()
	MIGRATIONS_FILE_URL = "file://./migrations"
)

func init() {
	ferrite.Init()

	ctx := context.WithValue(context.Background(), kryptos.ContextKeyDebug, false)

	db, close, err := kryptos.Open(ctx, MIGRATIONS_FILE_URL)
	if err != nil {
		panic(err)
	}
	defer close()

	err = kryptos.GetEnvs(ctx, db)
	if err != nil {
		panic(err)
	}

	for key, value := range kryptos.ENVS {
		os.Setenv(key, value)
	}

	envFilePath, ok := ENV_FILE_PATH.Value()
	if ok {
		loadedEnvs, err := godotenv.Read(envFilePath)
		if err != nil {
			panic(err)
		}

		for key, value := range loadedEnvs {
			kryptos.SetEnv(ctx, db, key, value, false)
		}
	}
}

func main() {
	usage := `Kryptos

Usage:
    kryptos set <key> <value> [-d | --debug] [-g | --global]
    kryptos mv <previous> <next> [-p | --project] [-g | --global]
    kryptos rm <key> [-d | --debug] [-a | --all] [-g | --global]
    kryptos grep <key>
    kryptos rotate (-e <encryption> | --encryption-key=<encryption>) [-d | --debug]
    kryptos cat
    kryptos dump [-o <output> | --output=<output>]
    kryptos prune <offset> [-d | --debug] [-a | --all] [-g | --global]
    kryptos info
    kryptos stat
    kryptos -h | --help
    kryptos -v | --version

Description:
    Manages environment variables
    Environment variables are encrypted and versioned

    Supported database drivers: sqlite3, postgres

Command reference:
    set     Set an environment variable
    mv      Rename an environment variable or project
    rm      Remove an environment variable
    grep    Get the value of an environment variable
    rotate  Change the encryption key used
    cat     List all environment variables
    dump    Print all environment variables to a file
    prune   Delete all environment variables linked to a project
    info    Kryptos information
    stat    Environment variable information

Options:
    -o --output=<output>              Output file [default: ./.env]
    -e --encryption-key=<encryption>  Encryption key
    -p --project                      Project
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

	db, close, err := kryptos.Open(ctx, MIGRATIONS_FILE_URL)
	if err != nil {
		panic(err)
	}
	defer close()

	err = kryptos.GetEnvs(ctx, db)
	if err != nil {
		panic(err)
	}

	set, _ := options.Bool("set")
	mv, _ := options.Bool("mv")
	rm, _ := options.Bool("rm")
	grep, _ := options.Bool("grep")
	rotate, _ := options.Bool("rotate")
	cat, _ := options.Bool("cat")
	dump, _ := options.Bool("dump")
	prune, _ := options.Bool("prune")
	info, _ := options.Bool("info")
	stat, _ := options.Bool("stat")

	if set {
		key, _ := options.String("<key>")
		value, _ := options.String("<value>")
		isGlobal, _ := options.Bool("--global")

		setEnvCommand := commands.SetEnv{
			Db:       db,
			Key:      key,
			Value:    value,
			IsGlobal: isGlobal,
		}

		err = setEnvCommand.Execute(ctx)
		if err != nil {
			panic(err)
		}
	} else if mv {
		previous, _ := options.String("<previous>")
		next, _ := options.String("<next>")
		isProject, _ := options.Bool("--project")
		isGlobal, _ := options.Bool("--global")

		mvCommand := commands.Mv{
			Db:        db,
			Previous:  previous,
			Next:      next,
			IsProject: isProject,
			IsGlobal:  isGlobal,
		}

		err = mvCommand.Execute(ctx)
		if err != nil {
			panic(err)
		}
	} else if rm {
		key, _ := options.String("<key>")
		includeDeprecated, _ := options.Bool("--all")
		includeGlobal, _ := options.Bool("--global")

		rmCommand := commands.Rm{
			Db:                db,
			Key:               key,
			IncludeDeprecated: includeDeprecated,
			IncludeGlobal:     includeGlobal,
		}

		err = rmCommand.Execute(ctx)
		if err != nil {
			panic(err)
		}
	} else if grep {
		key, _ := options.String("<key>")

		grepCommand := commands.Grep{
			Key:  key,
			View: os.Stdout,
		}

		err = grepCommand.Execute(ctx)
		if err != nil {
			panic(err)
		}
	} else if rotate {
		encryptionKey, _ := options.String("--encryption-key")

		rotateCommand := commands.Rotate{
			Db:            db,
			EncryptionKey: encryptionKey,
		}

		err = rotateCommand.Execute(ctx)
		if err != nil {
			panic(err)
		}
	} else if cat {
		catCommand := commands.Cat{
			View: os.Stdout,
		}

		err = catCommand.Execute(ctx)
		if err != nil {
			panic(err)
		}
	} else if dump {
		path, _ := options.String("--output")

		file, err := os.Create(path)
		if err != nil {
			panic(err)
		}
		defer file.Close()

		dumpCommand := commands.Dump{
			File: file,
		}

		err = dumpCommand.Execute(ctx)
		if err != nil {
			panic(err)
		}
	} else if prune {
		offset, _ := options.Int("<offset>")
		includeCurrent, _ := options.Bool("--all")
		pruneGlobal, _ := options.Bool("--global")

		pruneCommand := commands.Prune{
			Db:             db,
			Offset:         offset,
			IncludeCurrent: includeCurrent,
			PruneGlobal:    pruneGlobal,
		}

		err = pruneCommand.Execute(ctx)
		if err != nil {
			panic(err)
		}
	} else if info {
		infoCommand := commands.Info{
			View: os.Stdout,
		}

		err = infoCommand.Execute(ctx)
		if err != nil {
			panic(err)
		}
	} else if stat {
		statCommand := commands.Stat{
			Db:   db,
			View: os.Stdout,
		}

		err := statCommand.Execute(ctx)
		if err != nil {
			panic(err)
		}
	}
}
