package commands

import (
	"context"
	"fmt"
	"os"
	"skulpture/kryptos/kryptos"
)

type Dump struct {
	File *os.File
}

func (command *Dump) Execute(ctx context.Context) {
	out := ""

	for key, value := range kryptos.ENVS {
		out += fmt.Sprintf("%s=%s\n", key, value)
	}

	_, err := command.File.WriteString(out)
	if err != nil {
		panic(err)
	}

	command.File.Sync()
}
