package commands

import (
	"fmt"
	"os"
	"skulpture/secrets/kryptos"
)

type Dump struct {
	Path string
}

func (command *Dump) Execute() {
	out := ""

	for key, value := range kryptos.ENVS {
		out += fmt.Sprintf("%s=%s\n", key, value)
	}

	file, err := os.Create(command.Path)
	if err != nil {
		panic(err)
	}
	defer file.Close()

	_, err = file.WriteString(out)
	if err != nil {
		panic(err)
	}

	file.Sync()
}
