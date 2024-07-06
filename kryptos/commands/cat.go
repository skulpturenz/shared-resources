package commands

import (
	"context"
	"fmt"
	"io"
	"skulpture/kryptos/kryptos"
)

type Cat struct {
	View io.Writer
}

// eval $(kryptos cat)
func (command *Cat) Execute(ctx context.Context) error {
	for key, value := range kryptos.ENVS {
		_, err := fmt.Fprintf(command.View, "%s=%s\n", key, value)
		if err != nil {
			return err
		}
	}

	return nil
}
