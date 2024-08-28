package middleware

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"net/http"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
)

var (
	PROXY_TARGETS = map[string]Target{}
)

func getTargetConfig(targetUrl string) *Target {
	proxyTarget, ok := PROXY_TARGETS[targetUrl]
	if !ok {
		return nil
	}

	return &proxyTarget
}

func Verify(next http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		targetUrl := r.Header.Get("AUTHNZ_PROXY_TARGET")
		w.Header().Del("AUTHNZ_PROXY_TARGET")

		reqWithTargetUrl := r.WithContext(context.WithValue(r.Context(), TargetUrl, targetUrl))

		_, err := r.Cookie("state")
		if err != nil {
			authUrl, err := authenticate(w, reqWithTargetUrl)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)

				return
			}

			http.Redirect(w, r, authUrl, http.StatusFound)

			return
		}

		isAuthenticated, err := isAuthenticationValid(reqWithTargetUrl)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)

			return
		}

		if !isAuthenticated {
			authUrl, err := authenticate(w, reqWithTargetUrl)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)

				return
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

func isAuthenticationValid(r *http.Request) (bool, error) {
	proxyTarget := getTargetConfig(r.Context().Value(TargetUrl).(string))
	if proxyTarget == nil {
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
