package commands

import (
	"context"
	"database/sql"
	"fmt"
	"io"
	"skulpture/kryptos/kryptos"
	"text/tabwriter"
)

type Stat struct {
	Db   *sql.DB
	View io.Writer
}

func (command *Stat) Execute(ctx context.Context) error {
	w := tabwriter.NewWriter(command.View, 1, 4, 1, ' ', 0)

	fmt.Fprintln(w, "Key\tProject\tVersions")

	envStats, err := kryptos.Stats(ctx, command.Db)
	if err != nil {
		return err
	}

	for _, stat := range envStats {
		fmt.Fprintf(w, "%s\t%s\t%d\n", stat.Key, stat.Project, stat.Count)
	}

	return nil
}
