package commands

import (
	"context"
	"database/sql"
	"os"
	"skulpture/secrets/kryptos"
)

type Rotate struct {
	Ctx           context.Context
	Db            *sql.DB
	EncryptionKey string
}

func (command *Rotate) Execute() {
	os.Setenv("ENCRYPTION_KEY", command.EncryptionKey)

	for key, value := range kryptos.ENVS {
		kryptos.SetEnv(command.Ctx, command.Db, key, value, false)
	}
}
