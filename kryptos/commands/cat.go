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
func (command *Cat) Execute(ctx context.Context) {
	for key, value := range kryptos.ENVS {
		command.View.Write([]byte(fmt.Sprintf("%s=%s\n", key, value)))
	}
}
