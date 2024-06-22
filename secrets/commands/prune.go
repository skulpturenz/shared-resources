package commands

import (
	"context"
	"database/sql"
	"skulpture/secrets/kryptos"
)

type Prune struct {
	Ctx            context.Context
	Db             *sql.DB
	Offset         int
	IncludeCurrent bool
	PruneGlobal    bool
}

func (command *Prune) Execute() {
	if !command.IncludeCurrent {
		kryptos.PruneEnv(command.Ctx, command.Db, command.Offset, command.PruneGlobal)
	} else {
		kryptos.ClearEnv(command.Ctx, command.Db, command.Offset, command.PruneGlobal)
	}
}
