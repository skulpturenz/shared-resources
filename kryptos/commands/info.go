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
	project := fmt.Sprintf("Project: %s\n", kryptos.PROJECT.Value())
	driver := fmt.Sprintf("Database driver: %s\n", kryptos.DB_DRIVER.Value())
	dbConnectionString := fmt.Sprintf("Database connection string: %s\n", kryptos.DB_CONNECTION_STRING.Value())
	encryptionKey := fmt.Sprintf("Encryption key: %s\n", kryptos.ENCRYPTION_KEY.Value())
	version := fmt.Sprintf("Version: v%s\n", kryptos.VERSION)

	_, err := command.View.Write([]byte(project))
	if err != nil {
		return err
	}

	_, err = command.View.Write([]byte(driver))
	if err != nil {
		return err
	}

	_, err = command.View.Write([]byte(dbConnectionString))
	if err != nil {
		return err
	}

	_, err = command.View.Write([]byte(encryptionKey))
	if err != nil {
		return err
	}

	_, err = command.View.Write([]byte(version))
	if err != nil {
		return err
	}

	return nil
}
