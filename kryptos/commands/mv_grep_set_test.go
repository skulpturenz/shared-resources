package commands_test

import (
	"bytes"
	"context"
	"os"
	"skulpture/kryptos/commands"
	"skulpture/kryptos/kryptos"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestMvMixed(t *testing.T) {
	ctx := context.WithValue(context.Background(), kryptos.ContextKeyDebug, false)

	for driver, init := range DBs {
		t.Logf("database: %s", driver)

		stop := init(t)
		defer stop()

		db, close, err := kryptos.Open(ctx)
		if err != nil {
			t.Fatal(err)
		}
		defer close()

		err = kryptos.GetEnvs(ctx, db)
		if err != nil {
			t.Fatal(err)
		}

		envs := []commands.SetEnv{
			{
				Db:       db,
				Key:      "MV1",
				Value:    "MV1",
				IsGlobal: true,
			},
			{
				Db:       db,
				Key:      "MV2",
				Value:    "MV2",
				IsGlobal: false,
			},
		}

		for _, command := range envs {
			err = command.Execute(ctx)
			if err != nil {
				t.Fatal(err)
			}
		}

		GLOBAL_ENV_DECLARATION := envs[0]
		PROJECT_ENV_DECLARATION := envs[1]

		mvEnvCommands := []commands.Mv{
			{
				Db:        db,
				Previous:  GLOBAL_ENV_DECLARATION.Key,
				Next:      "MV3",
				IsProject: false,
				IsGlobal:  true,
			},
			{
				Db:        db,
				Previous:  PROJECT_ENV_DECLARATION.Key,
				Next:      "MV4",
				IsProject: false,
				IsGlobal:  false,
			},
		}

		RENAMED_GLOBAL_ENV := mvEnvCommands[0]
		RENAMED_PROJECT_ENV := mvEnvCommands[1]

		for _, command := range mvEnvCommands {
			err = command.Execute(ctx)
			if err != nil {
				t.Fatal(err)
			}
		}

		nextProjectName := "test2"
		mvProjectCommand := commands.Mv{
			Db:        db,
			Previous:  os.Getenv("PROJECT"),
			Next:      nextProjectName,
			IsProject: true,
			IsGlobal:  false,
		}

		mvProjectCommand.Execute(ctx)
		t.Setenv("PROJECT", nextProjectName)

		out := bytes.Buffer{}
		grepProjectEnvCommand := commands.Grep{
			Key:  RENAMED_PROJECT_ENV.Next,
			View: &out,
		}

		err = grepProjectEnvCommand.Execute(ctx)
		if err != nil {
			t.Fatal(err)
		}

		RESULT := strings.TrimSpace(out.String())
		assert.Equal(t, PROJECT_ENV_DECLARATION.Value, RESULT)

		out = bytes.Buffer{}
		grepGlobalEnvCommand := commands.Grep{
			Key:  RENAMED_GLOBAL_ENV.Next,
			View: &out,
		}

		err = grepGlobalEnvCommand.Execute(ctx)
		if err != nil {
			t.Fatal(err)
		}

		RESULT = strings.TrimSpace(out.String())
		assert.Equal(t, GLOBAL_ENV_DECLARATION.Value, RESULT)
	}
}
