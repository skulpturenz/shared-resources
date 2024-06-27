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
		fmt.Sprintf("Project: %s", kryptos.PROJECT.Value()),
		fmt.Sprintf("Database driver: %s", kryptos.DB_DRIVER.Value()),
		fmt.Sprintf("Database connection string: %s", kryptos.DB_CONNECTION_STRING.Value()),
		fmt.Sprintf("Encryption key: %s", kryptos.ENCRYPTION_KEY.Value()),
		fmt.Sprintf("Version: v%s", kryptos.VERSION),
	}

	for _, info := range info {
		_, err := fmt.Fprintln(command.View, info)
		if err != nil {
			return err
		}
	}

	return nil
}
