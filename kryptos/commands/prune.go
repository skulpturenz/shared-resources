package commands

import (
	"context"
	"database/sql"
	"skulpture/secrets/kryptos"
)

type Prune struct {
	Db             *sql.DB
	Offset         int
	IncludeCurrent bool
	PruneGlobal    bool
}

func (command *Prune) Execute(ctx context.Context) {
	if !command.IncludeCurrent {
		kryptos.PruneEnv(ctx, command.Db, command.Offset, command.PruneGlobal)
	} else {
		kryptos.ClearEnv(ctx, command.Db, command.Offset, command.PruneGlobal)
	}
}
