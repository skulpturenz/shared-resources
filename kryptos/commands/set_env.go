package commands

import (
	"context"
	"database/sql"
	"skulpture/kryptos/kryptos"
)

type SetEnv struct {
	Db       *sql.DB
	Key      string
	Value    string
	IsGlobal bool
}

func (command *SetEnv) Execute(ctx context.Context) error {
	err := kryptos.SetEnv(ctx, command.Db, command.Key, command.Value, command.IsGlobal)
	if err != nil {
		return err
	}

	return nil
}
