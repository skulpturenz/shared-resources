package commands

import (
	"fmt"
	"skulpture/secrets/kryptos"
)

type Grep struct {
	Key string
}

func (command *Grep) Execute() {
	fmt.Println(kryptos.ENVS[command.Key])
}
