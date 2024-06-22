package commands_test

import (
	"bytes"
	"context"
	"skulpture/secrets/commands"
	"skulpture/secrets/kryptos"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRotateMixed(t *testing.T) {
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
				Key:      "ROTATE1",
				Value:    "ROTATE1",
				IsGlobal: true,
			},
			{
				Db:       db,
				Key:      "ROTATE2",
				Value:    "ROTATE2",
				IsGlobal: false,
			},
			{
				Db:       db,
				Key:      "ROTATE1",
				Value:    "ROTATE1.1",
				IsGlobal: true,
			},
		}

		for _, command := range envs {
			command.Execute(ctx)
		}

		GLOBAL_ENV_DECLARATION := envs[2]
		PROJECT_ENV_DECLARATION := envs[1]

		encryptionKey, _ := RandomHex(32)
		rotateCommand := commands.Rotate{
			Db:            db,
			EncryptionKey: encryptionKey,
		}

		rotateCommand.Execute(ctx)

		out := bytes.Buffer{}
		grepProjectEnvCommand := commands.Grep{
			Key:  PROJECT_ENV_DECLARATION.Key,
			View: &out,
		}

		grepProjectEnvCommand.Execute(ctx)

		RESULT := strings.TrimSpace(out.String())
		assert.Equal(t, PROJECT_ENV_DECLARATION.Value, RESULT)

		out = bytes.Buffer{}
		grepGlobalEnvCommand := commands.Grep{
			Key:  GLOBAL_ENV_DECLARATION.Key,
			View: &out,
		}

		grepGlobalEnvCommand.Execute(ctx)

		RESULT = strings.TrimSpace(out.String())
		assert.Equal(t, GLOBAL_ENV_DECLARATION.Value, RESULT)
	}
}
