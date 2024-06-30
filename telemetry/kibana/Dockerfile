ARG ELK_VERSION

# https://github.com/elastic/kibana-docker
FROM docker.elastic.co/kibana/kibana:${ELK_VERSION}
ARG ELK_VERSION

# Add your kibana plugins setup here
# Example: RUN kibana-plugin install <name|url>

RUN kibana-plugin install https://artifacts.elastic.co/downloads/kibana-plugins/urlForwarding/urlForwarding-${ELK_VERSION}.zip