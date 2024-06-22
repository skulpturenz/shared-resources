package commands

import (
	"fmt"
	"skulpture/secrets/kryptos"
)

type Cat struct {
}

// eval $(kryptos cat)
func (command *Cat) Execute() {
	for key, value := range kryptos.ENVS {
		fmt.Printf("%s=%s\n", key, value)
	}
}
