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
	_, err := command.View.Write([]byte(fmt.Sprintf("%s\n", kryptos.ENVS[command.Key])))
	if err != nil {
		return err
	}

	return nil
}
