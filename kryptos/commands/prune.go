package commands

import (
	"context"
	"database/sql"
	"skulpture/kryptos/kryptos"
)

type Prune struct {
	Db             *sql.DB
	Offset         int
	IncludeCurrent bool
	PruneGlobal    bool
}

func (command *Prune) Execute(ctx context.Context) error {
	if !command.IncludeCurrent {
		err := kryptos.PruneEnv(ctx, command.Db, command.Offset, command.PruneGlobal)
		if err != nil {
			return err
		}
	} else {
		err := kryptos.ClearEnv(ctx, command.Db, command.Offset, command.PruneGlobal)
		if err != nil {
			return err
		}
	}

	return nil
}
