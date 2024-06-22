package commands_test

import (
	"bytes"
	"context"
	"skulpture/secrets/commands"
	"skulpture/secrets/kryptos"
	"strings"
	"testing"
)

func TestRmMixed(t *testing.T) {
	ctx := context.WithValue(context.Background(), kryptos.ContextKeyDebug, false)

	for dbName, init := range DBs {
		stop := init(t)
		defer stop()

		db, close := kryptos.Open(ctx)
		defer close()

		envs := map[string]string{
			"a": "123",
			"b": "456",
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

		KEY_TO_DELETE := "a"
		rmCommand := commands.Rm{
			Db:                db,
			Key:               KEY_TO_DELETE,
			IncludeDeprecated: true,
			PruneGlobal:       false,
		}

		rmCommand.Execute(ctx)

		var out bytes.Buffer
		grepCommand := commands.Grep{
			Key:  KEY_TO_DELETE,
			View: &out,
		}

		grepCommand.Execute(ctx)

		result := strings.TrimSpace(out.String())

		if result == "" {
			t.Errorf("db: %s, expected '%s' to be non empty", dbName, KEY_TO_DELETE)
		}
	}
}
