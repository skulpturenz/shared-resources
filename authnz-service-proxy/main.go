package main

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"io"
	"log/slog"
	"net/http"
	"os"
	"regexp"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/dogmatiq/ferrite"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/chi/v5"
	"golang.org/x/oauth2"
	"gopkg.in/yaml.v3"
)

var (
	GO_ENV = ferrite.
		String("GO_ENV", "Golang environment").
		WithDefault("Development").
		Required()
	PROXY_TARGETS = map[string]target{}
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

		PROXY_TARGETS[PROXY_TARGET_URL.Value()] = target{
			Url:          PROXY_TARGET_URL.Value(),
			Provider:     OIDC_PROVIDER_NAME.Value(),
			Issuer:       OIDC_ISSUER_URL.Value(),
			ClientID:     OIDC_CLIENT_ID.Value(),
			ClientSecret: OIDC_CLIENT_SECRET.Value(),
			RedirectUrl:  OIDC_REDIRECT_URL.Value(),
			Scopes: append([]string{oidc.ScopeOpenID},
				itemDelimiters.Split(OIDC_SCOPES.Value(), -1)...),
		}
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

		for _, proxyTarget := range cfg.Targets {
			proxyTarget.Scopes = append(proxyTarget.Scopes, oidc.ScopeOpenID)

			PROXY_TARGETS[proxyTarget.Url] = proxyTarget
		}
	}
}

func main() {
	ctx := context.Background()

	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.Heartbeat("/ping"))
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)

	methods := []string{
		http.MethodGet, http.MethodPost,
		http.MethodPut, http.MethodDelete,
		http.MethodPatch,
	}

	for _, method := range methods {
		r.MethodFunc(method, "*", verifyAndProxy)
	}

	slog.InfoContext(ctx, "listening", "port", ":80")
	http.ListenAndServe(":80", r)
}

func verifyAndProxy(w http.ResponseWriter, r *http.Request) {
	var targetUrl = r.Header.Get("AUTHNZ_PROXY_TARGET")
	w.Header().Del("AUTHNZ_PROXY_TARGET")

	if targetUrl == "" {
		return
	}

	proxyTarget, ok := PROXY_TARGETS[targetUrl]
	if !ok {
		http.Error(w, "undefined target", http.StatusInternalServerError)

		return
	}

	provider, err := oidc.NewProvider(r.Context(), proxyTarget.Issuer)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)

		return
	}

	config := oauth2.Config{
		ClientID:     proxyTarget.ClientID,
		ClientSecret: proxyTarget.ClientSecret,
		Endpoint:     provider.Endpoint(),
		RedirectURL:  proxyTarget.RedirectUrl,
		Scopes:       proxyTarget.Scopes,
	}

	hasState := false

	existingState, err := r.Cookie("state")
	if err == nil {
		hasState = true
	}

	if hasState && existingState.Value != r.URL.Query().Get("state") {
		http.Error(w, "state did not match", http.StatusBadRequest)

		return
	}

	if !hasState {
		newState, err := randString(16)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)

			return
		}
		newNonce, err := randString(16)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		setCallbackCookie(w, r, "state", newState)
		setCallbackCookie(w, r, "nonce", newNonce)

		http.Redirect(w, r, config.AuthCodeURL(newState, oidc.Nonce(newNonce)), http.StatusFound)

		return
	}

	oauth2Token, err := config.Exchange(r.Context(), r.URL.Query().Get("code"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)

		return
	}

	rawIdToken, ok := oauth2Token.Extra("id_token").(string)
	if !ok {
		http.Error(w, "no id_token field", http.StatusInternalServerError)

		return
	}

	verfier := provider.Verifier(&oidc.Config{
		ClientID: proxyTarget.ClientID,
	})
	idToken, err := verfier.Verify(r.Context(), rawIdToken)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)

		return
	}

	existingNonce, err := r.Cookie("nonce")
	if err != nil {
		http.Error(w, "nonce not found", http.StatusBadRequest)
		return
	}
	if idToken.Nonce != existingNonce.Value {
		http.Error(w, "nonce did not match", http.StatusBadRequest)
		return
	}

	http.Redirect(w, r, targetUrl, http.StatusPermanentRedirect)
}

func setCallbackCookie(w http.ResponseWriter, r *http.Request, name, value string) {
	c := &http.Cookie{
		Name:     name,
		Value:    value,
		MaxAge:   int(time.Hour.Seconds()),
		Secure:   r.TLS != nil,
		HttpOnly: true,
	}
	http.SetCookie(w, c)
}

func randString(nByte int) (string, error) {
	b := make([]byte, nByte)
	if _, err := io.ReadFull(rand.Reader, b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}
