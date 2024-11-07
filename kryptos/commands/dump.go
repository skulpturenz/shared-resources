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

func (command *Dump) Execute(ctx context.Context) error {
	out := ""

	for key, value := range kryptos.ENVS.Iterator() {
		out += fmt.Sprintf("%s=%s\n", key, value)
	}

	_, err := command.File.WriteString(out)
	if err != nil {
		return err
	}

	command.File.Sync()

	return nil
}
