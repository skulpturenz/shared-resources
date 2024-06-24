package watchdog

import (
	"context"
	"log/slog"
	"net/http"
	"plugin"
	"regexp"
	"sync"

	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/httplog"
	"github.com/radovskyb/watcher"
)

var (
	stack       = sync.Map{}
	pluginRegex = regexp.MustCompile(".so")
)

type LambdaInfo struct {
	Uuid    string
	Handler string
}

type Watchdog struct {
	ServiceName string
	Env         string
	PluginDir   string
	Port        string
}

func (watchdog *Watchdog) Start(ctx context.Context) error {
	err := watchdog.Watch(ctx, watchdog.PluginDir)
	if err != nil {
		return err
	}

	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	// TODO: otel middleware
	r.Use(httplog.RequestLogger(httplog.NewLogger(watchdog.ServiceName, httplog.Options{
		Concise: true,
		Tags: map[string]string{
			"env": watchdog.Env,
		},
	})))
	r.Use(middleware.Heartbeat("/ping"))
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)

	r.Use(func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()
			uuid, ok := ctx.Value("uuid").(string)
			if !ok {
				http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)

				return
			}

			router, ok := stack.Load(uuid)
			if !ok {
				http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			}

			router.(http.Handler).ServeHTTP(w, r)
		}

		return http.HandlerFunc(fn)
	})

	err = http.ListenAndServe(watchdog.Port, r)
	if err != nil {
		return err
	}

	return nil
}

func Load(path string) (*LambdaInfo, *http.HandlerFunc, error) {
	p, err := plugin.Open(path)
	if err != nil {
		return nil, nil, err
	}

	register, err := p.Lookup("Getinfo")
	if err != nil {
		return nil, nil, err
	}

	info := register.(func() LambdaInfo)()
	maybeHandler, err := p.Lookup(info.Handler)
	if err != nil {
		return nil, nil, err
	}

	handler := maybeHandler.(http.HandlerFunc)

	return &info, &handler, nil
}

func (watchdog *Watchdog) Watch(ctx context.Context, path string) error {
	w := watcher.New()

	w.AddFilterHook(watcher.RegexFilterHook(pluginRegex, false))

	go func() {
		for {
			select {
			case event := <-w.Event:
				info, handler, err := Load(event.Path)
				if err != nil {
					slog.ErrorContext(ctx, "watchdog", "failed to load plugin", err.Error(), "path", event.Path)
					break
				}

				stack.Store(info.Uuid, handler)

				slog.InfoContext(ctx, "watchdog", "loaded plugin", event.Path, "operation", event.Op)
			case err := <-w.Error:
				slog.ErrorContext(ctx, "watchdog", "failed to load plugin", err.Error())
			case <-w.Closed:
				return
			}
		}
	}()

	if err := w.AddRecursive(path); err != nil {
		return err
	}

	return nil
}
