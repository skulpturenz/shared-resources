package main

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
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

type ContextKey string

const TargetUrl ContextKey = "targetUrl"

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
	r.Use(verify)

	methods := []string{
		http.MethodGet, http.MethodPost,
		http.MethodPut, http.MethodDelete,
		http.MethodPatch,
	}

	for _, method := range methods {
		r.MethodFunc(method, "*", func(w http.ResponseWriter, r *http.Request) {
			http.Redirect(w, r, r.Context().Value(TargetUrl).(string), http.StatusPermanentRedirect)
		})
	}

	slog.InfoContext(ctx, "listening", "port", ":80")
	http.ListenAndServe(":80", r)
}

func getTargetConfig(targetUrl string) *target {
	proxyTarget, ok := PROXY_TARGETS[targetUrl]
	if !ok {
		return nil
	}

	return &proxyTarget
}

func verify(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		targetUrl := r.Header.Get("AUTHNZ_PROXY_TARGET")
		w.Header().Del("AUTHNZ_PROXY_TARGET")

		reqWithTargetUrl := r.WithContext(context.WithValue(r.Context(), TargetUrl, targetUrl))

		_, err := r.Cookie("state")
		if err != nil {
			authenticate(w, reqWithTargetUrl)

			return
		}

		isAuthenticated, err := isAuthenticationValid(w, reqWithTargetUrl)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}

		if !isAuthenticated {
			authUrl, err := authenticate(w, reqWithTargetUrl)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
			}

			http.Redirect(w, r, authUrl, http.StatusFound)

			return
		}

		next.ServeHTTP(w, reqWithTargetUrl)
	}

	return http.HandlerFunc(fn)
}

func authenticate(w http.ResponseWriter, r *http.Request) (string, error) {
	proxyTarget := getTargetConfig(r.Context().Value(TargetUrl).(string))
	if proxyTarget == nil {
		return "", errors.New("invalid target")
	}

	provider, err := oidc.NewProvider(r.Context(), proxyTarget.Issuer)
	if err != nil {
		return "", err
	}

	config := oauth2.Config{
		ClientID:     proxyTarget.ClientID,
		ClientSecret: proxyTarget.ClientSecret,
		Endpoint:     provider.Endpoint(),
		RedirectURL:  proxyTarget.RedirectUrl,
		Scopes:       proxyTarget.Scopes,
	}

	state, err := randString(16)
	if err != nil {

		return "", err
	}

	nonce, err := randString(16)
	if err != nil {
		return "", err
	}

	stateCookie := toCookie("state", state, r.TLS != nil)
	nonceCookie := toCookie("nonce", nonce, r.TLS != nil)

	http.SetCookie(w, stateCookie)
	http.SetCookie(w, nonceCookie)

	return config.AuthCodeURL(state, oidc.Nonce(nonce)), nil
}

func isAuthenticationValid(w http.ResponseWriter, r *http.Request) (bool, error) {
	proxyTarget := getTargetConfig(r.Context().Value(TargetUrl).(string))
	if proxyTarget == nil {
		http.Error(w, "undefined target", http.StatusInternalServerError)

		return false, errors.New("invalid target")
	}

	provider, err := oidc.NewProvider(r.Context(), proxyTarget.Issuer)
	if err != nil {
		return false, err
	}

	config := oauth2.Config{
		ClientID:     proxyTarget.ClientID,
		ClientSecret: proxyTarget.ClientSecret,
		Endpoint:     provider.Endpoint(),
		RedirectURL:  proxyTarget.RedirectUrl,
		Scopes:       proxyTarget.Scopes,
	}

	state, err := r.Cookie("state")
	if err != nil {
		return false, err
	}

	if state.Value != r.URL.Query().Get("state") {
		return false, errors.New("state did not match")
	}

	oauth2Token, err := config.Exchange(r.Context(), r.URL.Query().Get("code"))
	if err != nil {
		return false, err
	}

	rawIdToken, ok := oauth2Token.Extra("id_token").(string)
	if !ok {
		return false, err
	}

	verfier := provider.Verifier(&oidc.Config{
		ClientID: proxyTarget.ClientID,
	})
	idToken, err := verfier.Verify(r.Context(), rawIdToken)
	if err != nil {
		return false, errors.New("no id_token field")
	}

	nonce, err := r.Cookie("nonce")
	if err != nil {
		return false, errors.New("nonce not found")
	}
	if idToken.Nonce != nonce.Value {
		return false, errors.New("nonce did not match")
	}

	return true, nil
}

func toCookie(name string, value string, secure bool) *http.Cookie {
	return &http.Cookie{
		Name:     name,
		Value:    value,
		MaxAge:   int(time.Hour.Seconds()),
		Secure:   secure,
		HttpOnly: true,
	}
}

func randString(n int) (string, error) {
	b := make([]byte, n)

	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}

	return base64.RawURLEncoding.EncodeToString(b), nil
}
