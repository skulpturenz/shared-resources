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

func TestGrepMixed(t *testing.T) {
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
				Key:      "GREP1",
				Value:    "GREP1",
				IsGlobal: true,
			},
			{
				Db:       db,
				Key:      "GREP2",
				Value:    "GREP2",
				IsGlobal: false,
			},
			{
				Db:       db,
				Key:      "GREP1",
				Value:    "GREP1.1",
				IsGlobal: true,
			},
		}

		for _, command := range envs {
			command.Execute(ctx)
		}

		for _, command := range envs[1:] {
			var out bytes.Buffer
			grepCommand := commands.Grep{
				Key:  command.Key,
				View: &out,
			}

			EXPECT := fmt.Sprintf("%s\n", command.Value)

			grepCommand.Execute(ctx)

			RESULT := out.String()

			assert.Equal(t, EXPECT, RESULT)
		}
	}
}
