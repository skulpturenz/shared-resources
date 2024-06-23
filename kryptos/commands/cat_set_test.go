package commands_test

import (
	"bytes"
	"context"
	"fmt"
	"skulpture/kryptos/commands"
	"skulpture/kryptos/kryptos"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCatMixed(t *testing.T) {
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
				Key:      "CAT1",
				Value:    "CAT1",
				IsGlobal: true,
			},
			{
				Db:       db,
				Key:      "CAT2",
				Value:    "CAT2",
				IsGlobal: false,
			},
			{
				Db:       db,
				Key:      "CAT1",
				Value:    "CAT1.2",
				IsGlobal: true,
			},
		}

		for _, command := range envs {
			err = command.Execute(ctx)
			if err != nil {
				t.Fatal(err)
			}
		}

		out := bytes.Buffer{}
		catCommand := commands.Cat{
			View: &out,
		}

		err = catCommand.Execute(ctx)
		if err != nil {
			t.Fatal(err)
		}

		RESULT := out.String()

		DEPRECATED_GLOBAL_ENV_DECLARATION := fmt.Sprintf("%s=%s\n", envs[0].Key, envs[0].Value)
		GLOBAL_ENV_DECLARATION := fmt.Sprintf("%s=%s\n", envs[2].Key, envs[2].Value)
		PROJECT_ENV_DECLARATION := fmt.Sprintf("%s=%s\n", envs[1].Key, envs[1].Value)

		assert.NotContains(t, RESULT, DEPRECATED_GLOBAL_ENV_DECLARATION)
		assert.Contains(t, RESULT, GLOBAL_ENV_DECLARATION)
		assert.Contains(t, RESULT, PROJECT_ENV_DECLARATION)
	}
}
