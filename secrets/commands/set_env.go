package commands

import (
	"context"
	"database/sql"
	"skulpture/secrets/kryptos"
)

type SetEnv struct {
	Ctx      context.Context
	Db       *sql.DB
	Key      string
	Value    string
	IsGlobal bool
}

func (command *SetEnv) Execute() {
	kryptos.SetEnv(command.Ctx, command.Db, command.Key, command.Value, command.IsGlobal)
}
