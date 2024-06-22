package commands

import (
	"context"
	"fmt"
	"skulpture/secrets/kryptos"
)

type Grep struct {
	Key string
}

func (command *Grep) Execute(ctx context.Context) {
	fmt.Println(kryptos.ENVS[command.Key])
}
