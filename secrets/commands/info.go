package commands

import (
	"context"
	"fmt"
	"skulpture/secrets/kryptos"
)

type Info struct{}

func (command *Info) Execute(ctx context.Context) {
	fmt.Printf("Project: %s\n", kryptos.PROJECT.Value())
	fmt.Printf("Database driver: %s\n", kryptos.DB_DRIVER.Value())
	fmt.Printf("Database connection string: %s\n", kryptos.DB_CONNECTION_STRING.Value())
	fmt.Printf("Encryption key: %s\n", kryptos.ENCRYPTION_KEY.Value())
	fmt.Printf("Version: v%s\n", kryptos.VERSION)
}
