package commands_test

import (
	"bytes"
	"context"
	"skulpture/kryptos/commands"
	"skulpture/kryptos/kryptos"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRmMixed(t *testing.T) {
	ctx := context.WithValue(context.Background(), kryptos.ContextKeyDebug, false)

	for driver, init := range DBs {
		t.Logf("database: %s", driver)

		stop := init(t)
		defer stop()

		db, close, err := kryptos.Open(ctx, MIGRATIONS_FILE_URL)
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
				Key:      "RM1",
				Value:    "RM1",
				IsGlobal: true,
			},
			{
				Db:       db,
				Key:      "RM2",
				Value:    "RM2",
				IsGlobal: false,
			},
			{
				Db:       db,
				Key:      "RM1",
				Value:    "RM1.1",
				IsGlobal: true,
			},
		}

		for _, command := range envs {
			err = command.Execute(ctx)
			if err != nil {
				t.Fatal(err)
			}
		}

		GLOBAL_ENV_DECLARATION := envs[2]
		PROJECT_ENV_DECLARATION := envs[1]

		rmCurrentProjectEnvCommand := commands.Rm{
			Db:                db,
			Key:               PROJECT_ENV_DECLARATION.Key,
			IncludeDeprecated: false,
			IncludeGlobal:     false,
		}
		err = rmCurrentProjectEnvCommand.Execute(ctx)
		if err != nil {
			t.Fatal(err)
		}

		out := bytes.Buffer{}
		grepProjectEnvCommand := commands.Grep{
			Key:  PROJECT_ENV_DECLARATION.Key,
			View: &out,
		}

		err = grepProjectEnvCommand.Execute(ctx)
		if err != nil {
			t.Fatal(err)
		}

		RESULT := strings.TrimSpace(out.String())
		assert.Empty(t, RESULT)

		rmCurrentGlobalEnvCommand := commands.Rm{
			Db:                db,
			Key:               GLOBAL_ENV_DECLARATION.Key,
			IncludeDeprecated: false,
			IncludeGlobal:     true,
		}

		err = rmCurrentGlobalEnvCommand.Execute(ctx)
		if err != nil {
			t.Fatal(err)
		}

		out = bytes.Buffer{}
		grepGlobalEnvCommand := commands.Grep{
			Key:  GLOBAL_ENV_DECLARATION.Key,
			View: &out,
		}

		err = grepGlobalEnvCommand.Execute(ctx)
		if err != nil {
			t.Fatal(err)
		}

		RESULT = strings.TrimSpace(out.String())
		assert.Empty(t, RESULT)
	}
}
