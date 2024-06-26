package commands

import (
	"context"
	"database/sql"
	"skulpture/kryptos/kryptos"
)

type Mv struct {
	Db        *sql.DB
	Previous  string
	Next      string
	IsProject bool
	IsGlobal  bool
}

func (command *Mv) Execute(ctx context.Context) error {
	err := kryptos.Rename(ctx, command.Db, command.Previous, command.Next, command.IsGlobal, command.IsProject)
	if err != nil {
		return err
	}

	return nil
}
