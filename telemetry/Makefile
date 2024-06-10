.DEFAULT_GOAL:=help

COMPOSE_ALL_FILES := -f docker-compose.yml -f docker-compose.logs.yml -f docker-compose.proxy.yml
COMPOSE_LOGGING := -f docker-compose.yml -f docker-compose.logs.yml
ELK_SERVICES   := elasticsearch logstash kibana apm-server
ELK_LOG_COLLECTION := filebeat
ELK_ALL_SERVICES := ${ELK_SERVICES} ${ELK_LOG_COLLECTION}
DOCKER_SWARM_COMMAND = docker stack
DOCKER_SERVICE_COMMAND = docker service

compose_v2_not_supported = $(shell command docker compose 2> /dev/null)
ifeq (,$(compose_v2_not_supported))
  DOCKER_COMPOSE_COMMAND = docker-compose
else
  DOCKER_COMPOSE_COMMAND = docker compose
endif

# --------------------------
.PHONY: setup keystore certs all elk monitoring build down stop restart rm logs

## In Docker Swarm, env files are not loaded automatically
## Run the below in the current shell to set environment variables from a file
# loadenv:
# 	set -o allexport && . ./.env && set +o allexport

keystore:		## Setup Elasticsearch Keystore, by initializing passwords, and add credentials defined in `keystore.sh`.
	$(DOCKER_COMPOSE_COMMAND) -f docker-compose.setup.yml run --rm keystore

certs:		    ## Generate Elasticsearch SSL Certs.
	$(DOCKER_COMPOSE_COMMAND) -f docker-compose.setup.yml run --rm certs

setup:		    ## Generate Elasticsearch SSL Certs and Keystore.
	@make certs
	@make keystore

elk:		    ## Start ELK.
	$(DOCKER_SWARM_COMMAND) deploy --compose-file docker-compose.yml elastic

logs:
	$(DOCKER_SWARM_COMMAND) deploy --compose-file docker-compose.logs.yml elastic

proxy:
	$(DOCKER_SWARM_COMMAND) deploy --compose-file docker-compose.proxy.yml elastic

up:
	@make elk

build:			## Build ELK and all its extra components.
	$(DOCKER_COMPOSE_COMMAND) ${COMPOSE_ALL_FILES} build

ps:				## Show all running containers.
	$(DOCKER_SERVICE_COMMAND) ls

stop:			## Stop ELK and all its extra components.
	$(DOCKER_SERVICE_COMMAND) ls -q | xargs -I {} -n1 ${DOCKER_SERVICE_COMMAND} scale {}=0
	
restart:		## Restart ELK and all its extra components. (run as root on linux)
	$(DOCKER_SERVICE_COMMAND) ls -q | xargs -n1 ${DOCKER_SERVICE_COMMAND} update --force

rm:				## Remove ELK and all its extra components containers.
	$(DOCKER_SWARM_COMMAND) rm elastic 

help:       	## Show this help.
	@echo "Make Application Docker Images and Containers using Docker-Compose files in 'docker' Dir."
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m (default: help)\n\nTargets:\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
