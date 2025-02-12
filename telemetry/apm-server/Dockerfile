ARG ELK_VERSION

# https://github.com/elastic/apm-server
FROM docker.elastic.co/apm/apm-server:${ELK_VERSION}
ARG ELK_VERSION

USER root
RUN apt update && apt upgrade -y && apt install -y curl
USER apm-server
