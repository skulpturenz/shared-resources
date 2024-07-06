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

func TestPruneMixed(t *testing.T) {
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
				Key:      "PRUNE1",
				Value:    "PRUNE1",
				IsGlobal: true,
			},
			{
				Db:       db,
				Key:      "PRUNE2",
				Value:    "PRUNE2",
				IsGlobal: false,
			},
			{
				Db:       db,
				Key:      "PRUNE1",
				Value:    "PRUNE1.1",
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

		INITIAL_CAT := out.String()

		DEPRECATED_GLOBAL_ENV_DECLARATION := fmt.Sprintf("%s=%s\n", envs[0].Key, envs[0].Value)
		GLOBAL_ENV_DECLARATION := fmt.Sprintf("%s=%s\n", envs[2].Key, envs[2].Value)
		PROJECT_ENV_DECLARATION := fmt.Sprintf("%s=%s\n", envs[1].Key, envs[1].Value)

		assert.NotContains(t, INITIAL_CAT, DEPRECATED_GLOBAL_ENV_DECLARATION)
		assert.Contains(t, INITIAL_CAT, PROJECT_ENV_DECLARATION)
		assert.Contains(t, INITIAL_CAT, GLOBAL_ENV_DECLARATION)

		pruneCurrentProjectCommand := commands.Prune{
			Db:             db,
			Offset:         0,
			IncludeCurrent: true,
			PruneGlobal:    false,
		}
		err = pruneCurrentProjectCommand.Execute(ctx)
		if err != nil {
			t.Fatal(err)
		}

		out = bytes.Buffer{}
		err = catCommand.Execute(ctx)
		if err != nil {
			t.Fatal(err)
		}

		AFTER_PRUNE_CAT := out.String()

		assert.NotContains(t, AFTER_PRUNE_CAT, DEPRECATED_GLOBAL_ENV_DECLARATION)
		assert.Contains(t, AFTER_PRUNE_CAT, GLOBAL_ENV_DECLARATION)
		assert.NotContains(t, AFTER_PRUNE_CAT, PROJECT_ENV_DECLARATION)

		pruneDeprecatedGlobalCommand := commands.Prune{
			Db:             db,
			Offset:         0,
			IncludeCurrent: false,
			PruneGlobal:    true,
		}
		err = pruneDeprecatedGlobalCommand.Execute(ctx)
		if err != nil {
			t.Fatal(err)
		}

		out = bytes.Buffer{}
		err = catCommand.Execute(ctx)
		if err != nil {
			t.Fatal(err)
		}

		AFTER_PRUNE_CAT = out.String()

		assert.NotContains(t, AFTER_PRUNE_CAT, DEPRECATED_GLOBAL_ENV_DECLARATION)
		assert.Contains(t, AFTER_PRUNE_CAT, GLOBAL_ENV_DECLARATION)
		assert.NotContains(t, AFTER_PRUNE_CAT, PROJECT_ENV_DECLARATION)

		pruneCurrentGlobalCommand := commands.Prune{
			Db:             db,
			Offset:         0,
			IncludeCurrent: true,
			PruneGlobal:    true,
		}
		err = pruneCurrentGlobalCommand.Execute(ctx)
		if err != nil {
			t.Fatal(err)
		}

		out = bytes.Buffer{}
		err = catCommand.Execute(ctx)
		if err != nil {
			t.Fatal(err)
		}

		AFTER_PRUNE_CAT = out.String()

		assert.NotContains(t, AFTER_PRUNE_CAT, DEPRECATED_GLOBAL_ENV_DECLARATION)
		assert.NotContains(t, AFTER_PRUNE_CAT, GLOBAL_ENV_DECLARATION)
		assert.NotContains(t, AFTER_PRUNE_CAT, PROJECT_ENV_DECLARATION)
	}
}
