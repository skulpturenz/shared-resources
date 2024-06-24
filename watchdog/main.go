package main

import (
	"context"
	"skulpture/watchdog/watchdog"

	"github.com/dogmatiq/ferrite"
)

var (
	SERVICE_NAME = ferrite.
			String("SERVICE_NAME", "OpenTelemetry service name").
			WithDefault("Watchdog").
			Required()
	GO_ENV = ferrite.
		String("GO_ENV", "Golang environment").
		WithDefault("Development").
		Required()
	PLUGIN_DIR = ferrite.
			String("LAMBDA_DIR", "Lambda directory").
			WithDefault("./lambda").
			Required()
	PORT = ferrite.
		String("PORT", "Port").
		WithDefault("8080").
		Required()
)

func init() {
	ferrite.Init()
}

func main() {
	ctx := context.Background()

	watchdog := watchdog.Watchdog{
		ServiceName: SERVICE_NAME.Value(),
		Env:         GO_ENV.Value(),
		Port:        PORT.Value(),
	}

	err := watchdog.Start(ctx)
	if err != nil {
		panic(err)
	}
}
