package commands

import (
	"context"
	"database/sql"
	"os"
	"skulpture/kryptos/kryptos"
)

type Rotate struct {
	Db            *sql.DB
	EncryptionKey string
}

func (command *Rotate) Execute(ctx context.Context) {
	os.Setenv("ENCRYPTION_KEY", command.EncryptionKey)

	for key, value := range kryptos.ENVS {
		kryptos.SetEnv(ctx, command.Db, key, value, false)
	}
}
