ARG KEYCLOAK_VERSION

FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION} as builder

ARG KEYCLOAK_CACHE
ARG KEYCLOAK_CACHE_STACK
ARG KEYCLOAK_DB

# Enable health and metrics support
ENV KC_HEALTH_ENABLED true
ENV KC_METRICS_ENABLED true

ENV KC_CACHE $KEYCLOAK_CACHE
ENV KC_CACHE_STACK $KEYCLOAK_CACHE_STACK
ENV KC_DB $KEYCLOAK_DB

WORKDIR /opt/keycloak

RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION}
COPY --from=builder /opt/keycloak/ /opt/keycloak/

ADD --chown=keycloak:keycloak https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar /tmp/opentelemetry-javaagent.jar

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]