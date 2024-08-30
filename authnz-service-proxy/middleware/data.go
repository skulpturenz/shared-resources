package middleware

type ContextKey string

const TargetUrl ContextKey = "targetUrl"

type Target struct {
	Url          string   `yaml:"url"`
	Provider     string   `yaml:"provider"`
	Issuer       string   `yaml:"issuer"`
	ClientID     string   `yaml:"clientId"`
	ClientSecret string   `yaml:"clientSecret"`
	RedirectUrl  string   `yaml:"redirectUrl"`
	Scopes       []string `yaml:"scopes"`
}

type Config struct {
	Targets []Target `yaml:"targets"`
}
