package commands

import (
	"context"
	"database/sql"
	"skulpture/secrets/kryptos"
)

type Rm struct {
	Ctx       context.Context
	Db        *sql.DB
	Key       string
	DeleteAll bool
}

func (command *Rm) Execute() {
	kryptos.DeleteEnv(command.Ctx, command.Db, command.Key, command.DeleteAll)
}
