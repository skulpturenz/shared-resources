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

		db, close := kryptos.Open(ctx)
		defer close()

		kryptos.GetEnvs(ctx, db)

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
			command.Execute(ctx)
		}

		GLOBAL_ENV_DECLARATION := envs[2]
		PROJECT_ENV_DECLARATION := envs[1]

		rmCurrentProjectEnvCommand := commands.Rm{
			Db:                db,
			Key:               PROJECT_ENV_DECLARATION.Key,
			IncludeDeprecated: false,
			IncludeGlobal:     false,
		}
		rmCurrentProjectEnvCommand.Execute(ctx)

		out := bytes.Buffer{}
		grepProjectEnvCommand := commands.Grep{
			Key:  PROJECT_ENV_DECLARATION.Key,
			View: &out,
		}

		grepProjectEnvCommand.Execute(ctx)

		RESULT := strings.TrimSpace(out.String())
		assert.Empty(t, RESULT)

		rmCurrentGlobalEnvCommand := commands.Rm{
			Db:                db,
			Key:               GLOBAL_ENV_DECLARATION.Key,
			IncludeDeprecated: false,
			IncludeGlobal:     true,
		}

		rmCurrentGlobalEnvCommand.Execute(ctx)

		out = bytes.Buffer{}
		grepGlobalEnvCommand := commands.Grep{
			Key:  GLOBAL_ENV_DECLARATION.Key,
			View: &out,
		}

		grepGlobalEnvCommand.Execute(ctx)

		RESULT = strings.TrimSpace(out.String())
		assert.Empty(t, RESULT)
	}
}
