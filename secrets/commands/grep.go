package commands

import (
	"context"
	"fmt"
	"io"
	"skulpture/secrets/kryptos"
)

type Grep struct {
	Key  string
	View io.Writer
}

func (command *Grep) Execute(ctx context.Context) {
	command.View.Write([]byte(fmt.Sprintf("%s\n", kryptos.ENVS[command.Key])))
}
