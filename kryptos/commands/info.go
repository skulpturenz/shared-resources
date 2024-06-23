package commands

import (
	"context"
	"fmt"
	"io"
	"skulpture/kryptos/kryptos"
)

type Info struct {
	View io.Writer
}

func (command *Info) Execute(ctx context.Context) error {
	info := []string{
		fmt.Sprintf("Project: %s\n", kryptos.PROJECT.Value()),
		fmt.Sprintf("Database driver: %s\n", kryptos.DB_DRIVER.Value()),
		fmt.Sprintf("Database connection string: %s\n", kryptos.DB_CONNECTION_STRING.Value()),
		fmt.Sprintf("Encryption key: %s\n", kryptos.ENCRYPTION_KEY.Value()),
		fmt.Sprintf("Version: v%s\n", kryptos.VERSION),
	}

	for _, info := range info {
		_, err := command.View.Write([]byte(info))
		if err != nil {
			return err
		}
	}

	return nil
}
