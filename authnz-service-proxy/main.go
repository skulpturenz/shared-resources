package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"regexp"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/dogmatiq/ferrite"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/chi/v5"
	"gopkg.in/yaml.v3"
)

var (
	GO_ENV = ferrite.
		String("GO_ENV", "Golang environment").
		WithDefault("Development").
		Required()
)

type target struct {
	Url          string   `yaml:"url"`
	Provider     string   `yaml:"provider"`
	Issuer       string   `yaml:"issuer"`
	ClientID     string   `yaml:"clientId"`
	ClientSecret string   `yaml:"clientSecret"`
	RedirectUrl  string   `yaml:"redirectUrl"`
	Scopes       []string `yaml:"scopes"`
}

type config struct {
	Targets []target `yaml:"targets"`
}

func init() {
	var (
		CONFIG_PATH = ferrite.
				String("CONFIG_PATH", "Config path if multiple targets are required").
				Optional()
		PROXY_TARGET_URL   ferrite.Required[string]
		OIDC_PROVIDER_NAME ferrite.Required[string]
		OIDC_ISSUER_URL    ferrite.Required[string]
		OIDC_CLIENT_ID     ferrite.Required[string]
		OIDC_CLIENT_SECRET ferrite.Required[string]
		OIDC_REDIRECT_URL  ferrite.Required[string]
		OIDC_SCOPES        ferrite.Required[string]
		PROXY_TARGETS      = []target{}
	)

	configPath, isConfigSpecified := CONFIG_PATH.Value()

	if !isConfigSpecified {
		PROXY_TARGET_URL = ferrite.
			String("PROXY_TARGET", "Proxy target url").
			Required()
		OIDC_PROVIDER_NAME = ferrite.
			String("OIDC_PROVIDER_NAME", "OIDC provider name").
			Required()
		OIDC_ISSUER_URL = ferrite.
			String("OIDC_ISSUER_URL", "OIDC issuer url").
			Required()
		OIDC_CLIENT_ID = ferrite.
			String("OIDC_CLIENT_ID", "OIDC client id").
			WithSensitiveContent().
			Required()
		OIDC_CLIENT_SECRET = ferrite.
			String("OIDC_CLIENT_SECRET", "OIDC client secret").
			WithSensitiveContent().
			Required()
		OIDC_REDIRECT_URL = ferrite.
			String("OIDC_REDIRECT_URL", "OIDC redirect url").
			Required()
		OIDC_SCOPES = ferrite.
			String("OIDC_SCOPES", "OIDC scopes, comma delimited").
			Required()
	}

	ferrite.Init()

	if !isConfigSpecified {
		itemDelimiters := regexp.MustCompile(`,\s*|\s+`)

		PROXY_TARGETS = append(PROXY_TARGETS, target{
			Url:          PROXY_TARGET_URL.Value(),
			Provider:     OIDC_PROVIDER_NAME.Value(),
			Issuer:       OIDC_ISSUER_URL.Value(),
			ClientID:     OIDC_CLIENT_ID.Value(),
			ClientSecret: OIDC_CLIENT_SECRET.Value(),
			RedirectUrl:  OIDC_REDIRECT_URL.Value(),
			Scopes: append([]string{oidc.ScopeOpenID},
				itemDelimiters.Split(OIDC_SCOPES.Value(), -1)...),
		})
	}

	if isConfigSpecified {
		file, err := os.ReadFile(configPath)
		if err != nil {
			panic(err)
		}

		cfg := &config{}
		err = yaml.Unmarshal(file, cfg)
		if err != nil {
			panic(err)
		}

		PROXY_TARGETS = append(PROXY_TARGETS, cfg.Targets...)
	}
}

func main() {
	ctx := context.Background()

	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.Heartbeat("/ping"))
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)

	slog.InfoContext(ctx, "listening", "port", ":80")
	http.ListenAndServe(":80", r)
}
