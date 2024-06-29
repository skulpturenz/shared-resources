package main_test

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	vegeta "github.com/tsenart/vegeta/lib"
)

func TestTelemetryKibana(t *testing.T) {
	rate := vegeta.Rate{Freq: 100, Per: time.Second} // TODO
	duration := 4 * time.Second                      // TODO
	targeter := vegeta.NewStaticTargeter(vegeta.Target{
		Method: "GET",
		URL:    "https://localhost:443/",
	})
	attacker := vegeta.NewAttacker()

	var metrics vegeta.Metrics
	for res := range attacker.Attack(targeter, rate, duration, "Kibana") {
		metrics.Add(res)
	}
	metrics.Close()

	t.Logf("Total requests (Kibana): %d", metrics.Requests)
	t.Logf("Success rate (Kibana): %f", metrics.Success)

	assert.Equal(t, metrics.Success, float64(100)) // TODO
}

func TestTelemetryElasticsearch(t *testing.T) {
	rate := vegeta.Rate{Freq: 100, Per: time.Second} // TODO
	duration := 4 * time.Second                      // TODO
	targeter := vegeta.NewStaticTargeter(vegeta.Target{
		Method: "GET",
		URL:    "https://localhost:2053/",
	})
	attacker := vegeta.NewAttacker()

	var metrics vegeta.Metrics
	for res := range attacker.Attack(targeter, rate, duration, "Elasticsearch") {
		metrics.Add(res)
	}
	metrics.Close()

	t.Logf("Total requests (Elasticsearch): %d", metrics.Requests)
	t.Logf("Success rate (Elasticsearch): %f", metrics.Success)

	assert.Equal(t, metrics.Success, float64(100)) // TODO
}

func TestTelemetryAPM(t *testing.T) {
	rate := vegeta.Rate{Freq: 100, Per: time.Second} // TODO
	duration := 4 * time.Second                      // TODO
	targeter := vegeta.NewStaticTargeter(vegeta.Target{
		Method: "GET",
		URL:    "https://localhost:2083/",
	})
	attacker := vegeta.NewAttacker()

	var metrics vegeta.Metrics
	for res := range attacker.Attack(targeter, rate, duration, "APM") {
		metrics.Add(res)
	}
	metrics.Close()

	t.Logf("Total requests (APM): %d", metrics.Requests)
	t.Logf("Success rate (APM): %f", metrics.Success)

	assert.Equal(t, metrics.Success, float64(100)) // TODO
}

func TestAuthnz(t *testing.T) {
	rate := vegeta.Rate{Freq: 100, Per: time.Second} // TODO
	duration := 4 * time.Second                      // TODO
	targeter := vegeta.NewStaticTargeter(vegeta.Target{
		Method: "GET",
		URL:    "https://localhost/",
	})
	attacker := vegeta.NewAttacker()

	var metrics vegeta.Metrics
	for res := range attacker.Attack(targeter, rate, duration, "Authnz") {
		metrics.Add(res)
	}
	metrics.Close()

	t.Logf("Total requests (Authnz): %d", metrics.Requests)
	t.Logf("Success rate (Authnz): %f", metrics.Success)

	assert.Equal(t, metrics.Success, float64(100)) // TODO
}

func TestRollout(t *testing.T) {
	rate := vegeta.Rate{Freq: 100, Per: time.Second} // TODO
	duration := 4 * time.Second                      // TODO
	targeter := vegeta.NewStaticTargeter(vegeta.Target{
		Method: "GET",
		URL:    "https://localhost/",
	})
	attacker := vegeta.NewAttacker()

	var metrics vegeta.Metrics
	for res := range attacker.Attack(targeter, rate, duration, "Rollout") {
		metrics.Add(res)
	}
	metrics.Close()

	t.Logf("Total requests (Rollout): %d", metrics.Requests)
	t.Logf("Success rate (Rollout): %f", metrics.Success)

	assert.Equal(t, metrics.Success, float64(100)) // TODO
}
