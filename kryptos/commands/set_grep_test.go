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

func TestSetMixed(t *testing.T) {
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
				Key:      "SET1",
				Value:    "SET1",
				IsGlobal: true,
			},
			{
				Db:       db,
				Key:      "SET2",
				Value:    "SET2",
				IsGlobal: false,
			},
			{
				Db:       db,
				Key:      "SET1",
				Value:    "SET1.1",
				IsGlobal: true,
			},
		}

		GLOBAL_ENV_DECLARATION := envs[2]
		PROJECT_ENV_DECLARATION := envs[1]

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

		for _, command := range envs {
			err = command.Execute(ctx)
			if err != nil {
				t.Fatal(err)
			}
		}

		out = bytes.Buffer{}

		err = grepProjectEnvCommand.Execute(ctx)
		if err != nil {
			t.Fatal(err)
		}

		RESULT = strings.TrimSpace(out.String())
		assert.Equal(t, PROJECT_ENV_DECLARATION.Value, RESULT)

		out = bytes.Buffer{}

		err = grepGlobalEnvCommand.Execute(ctx)
		if err != nil {
			t.Fatal(err)
		}

		RESULT = strings.TrimSpace(out.String())
		assert.Equal(t, GLOBAL_ENV_DECLARATION.Value, RESULT)
	}
}
