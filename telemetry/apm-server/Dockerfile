ARG ELK_VERSION

# https://github.com/elastic/apm-server
FROM docker.elastic.co/apm/apm-server:${ELK_VERSION}
ARG ELK_VERSION

RUN apt update && apt install curl
