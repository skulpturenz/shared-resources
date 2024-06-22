package commands_test

import (
	"bytes"
	"context"
	"fmt"
	"skulpture/secrets/commands"
	"skulpture/secrets/kryptos"
	"testing"
)

func TestGrepMixed(t *testing.T) {
	ctx := context.WithValue(context.Background(), kryptos.ContextKeyDebug, false)

	for dbName, init := range DBs {
		stop := init(t)
		defer stop()

		db, close := kryptos.Open(ctx)
		defer close()

		envs := map[string]string{
			"hello": "world",
			"world": "hello",
		}

		i := 0
		for key, value := range envs {
			setCommand := commands.SetEnv{
				Db:       db,
				Key:      key,
				Value:    value,
				IsGlobal: i%2 == 0,
			}

			setCommand.Execute(ctx)

			i++
		}

		for key, value := range envs {
			var out bytes.Buffer
			grepCommand := commands.Grep{
				Key:  key,
				View: &out,
			}

			expect := fmt.Sprintf("%s\n", value)

			grepCommand.Execute(ctx)

			result := out.String()

			if result != expect {
				t.Errorf("db: %s, expected '%s' but got '%s'", dbName, expect, result)
			}
		}
	}
}
