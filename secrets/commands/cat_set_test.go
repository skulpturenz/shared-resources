package commands_test

import (
	"bytes"
	"context"
	"fmt"
	"skulpture/secrets/commands"
	"skulpture/secrets/kryptos"
	"strings"
	"testing"
)

func TestCatMixed(t *testing.T) {
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
		expect := ""

		i := 0
		for key, value := range envs {
			expect += fmt.Sprintf("%s=%s\n", key, value)
			setCommand := commands.SetEnv{
				Db:       db,
				Key:      key,
				Value:    value,
				IsGlobal: i%2 == 0,
			}

			setCommand.Execute(ctx)

			i++
		}

		var out bytes.Buffer
		catCommand := commands.Cat{
			View: &out,
		}

		catCommand.Execute(ctx)

		result := out.String()
		for key, value := range envs {
			if !strings.Contains(result, fmt.Sprintf("%s=%s\n", key, value)) {
				t.Errorf("db: %s, expected %s but got %s", dbName, expect, result)
			}
		}
	}
}
