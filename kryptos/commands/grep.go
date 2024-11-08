package commands

import (
	"context"
	"fmt"
	"io"
	"skulpture/kryptos/kryptos"
)

type Grep struct {
	Key  string
	View io.Writer
}

func (command *Grep) Execute(ctx context.Context) error {
	value, ok := kryptos.ENVS.Get(command.Key)
	if !ok {
		return nil
	}

	_, err := fmt.Fprintf(command.View, "%s\n", value)
	if err != nil {
		return err
	}

	return nil
}
