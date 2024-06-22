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

func TestPruneMixed(t *testing.T) {
	ctx := context.WithValue(context.Background(), kryptos.ContextKeyDebug, false)

	for dbName, init := range DBs {
		stop := init(t)
		defer stop()

		db, close := kryptos.Open(ctx)
		defer close()

		envs := map[string]string{
			"hello": "123",
			"world": "456",
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

		var out bytes.Buffer
		catCommand := commands.Cat{
			View: &out,
		}

		catCommand.Execute(ctx)

		result := out.String()
		for key, value := range envs {
			expect := fmt.Sprintf("%s=%s\n", key, value)

			if !strings.Contains(result, expect) {
				t.Errorf("db: %s, expected '%s' to contain '%s'", dbName, result, expect)
			}
		}

		pruneCommand := commands.Prune{
			Db:             db,
			Offset:         0,
			IncludeCurrent: true,
			PruneGlobal:    false,
		}

		pruneCommand.Execute(ctx)

		var afterPruned bytes.Buffer
		catCommand = commands.Cat{
			View: &afterPruned,
		}

		catCommand.Execute(ctx)

		result = afterPruned.String()
		if strings.Contains(result, "world") {
			t.Errorf("db: %s, expected 'world' to not be present", dbName)
		}

		if !strings.Contains(result, "hello") {
			t.Errorf("db: %s, expected 'hello' to be present", dbName)
		}
	}
}
