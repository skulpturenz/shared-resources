package commands

import (
	"context"
	"database/sql"
	"skulpture/secrets/kryptos"
)

type Rm struct {
	Db                *sql.DB
	Key               string
	IncludeDeprecated bool
	IncludeGlobal     bool
}

func (command *Rm) Execute(ctx context.Context) {
	kryptos.DeleteEnv(ctx, command.Db, command.Key, command.IncludeDeprecated, command.IncludeGlobal)
}
