package commands_test

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"skulpture/kryptos/commands"
	"skulpture/kryptos/kryptos"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDumpMixed(t *testing.T) {
	ctx := context.WithValue(context.Background(), kryptos.ContextKeyDebug, false)

	for driver, init := range DBs {
		t.Logf("database: %s", driver)

		stop := init(t)
		defer stop()

		db, close, err := kryptos.Open(ctx)
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
				Key:      "SETENV1",
				Value:    "SETENV1",
				IsGlobal: true,
			},
			{
				Db:       db,
				Key:      "SETENV2",
				Value:    "SETENV2",
				IsGlobal: false,
			},
			{
				Db:       db,
				Key:      "SETENV1",
				Value:    "SETENV1.2",
				IsGlobal: true,
			},
		}

		for _, command := range envs {
			err = command.Execute(ctx)
			if err != nil {
				t.Fatal(err)
			}
		}

		tmp, err := os.CreateTemp("./", "secrets-dump")
		if err != nil {
			t.Fatal(err)
		}
		defer tmp.Close()
		defer os.Remove(tmp.Name())

		dumpCommand := commands.Dump{
			File: tmp,
		}
		err = dumpCommand.Execute(ctx)
		if err != nil {
			t.Fatal(err)
		}

		tmp.Seek(0, 0)
		s := bufio.NewScanner(tmp)

		RESULT := ""
		for s.Scan() {
			RESULT += fmt.Sprintf("%s\n", s.Text())
		}

		DEPRECATED_GLOBAL_ENV_DECLARATION := fmt.Sprintf("%s=%s\n", envs[0].Key, envs[0].Value)
		GLOBAL_ENV_DECLARATION := fmt.Sprintf("%s=%s\n", envs[2].Key, envs[2].Value)
		PROJECT_ENV_DECLARATION := fmt.Sprintf("%s=%s\n", envs[1].Key, envs[1].Value)

		assert.NotContains(t, RESULT, DEPRECATED_GLOBAL_ENV_DECLARATION)
		assert.Contains(t, RESULT, GLOBAL_ENV_DECLARATION)
		assert.Contains(t, RESULT, PROJECT_ENV_DECLARATION)
	}
}
