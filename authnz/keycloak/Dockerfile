ARG KEYCLOAK_VERSION

# Build Keycloak theme
FROM node:lts-alpine AS theme_builder

WORKDIR /build

COPY --from=theme . .

RUN apk add maven && \
    corepack enable pnpm && \
    pnpm config set store-dir /home/node/.local/share/pnpm/store && \
    corepack pnpm install && \
    corepack pnpm build-keycloak-theme

# Build Keycloak
FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION} AS keycloak_builder

ARG KEYCLOAK_CACHE
ARG KEYCLOAK_CACHE_STACK
ARG KEYCLOAK_FEATURES
ARG KEYCLOAK_DB

# Enable health and metrics support
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

ENV KC_CACHE=$KEYCLOAK_CACHE
ENV KC_CACHE_STACK=$KEYCLOAK_CACHE_STACK
ENV KC_FEATURES=$KEYCLOAK_FEATURES
ENV KC_DB=$KEYCLOAK_DB

WORKDIR /opt/keycloak

COPY --from=theme_builder /build/dist_keycloak/keycloak-theme-for-kc-22-to-25.jar /opt/keycloak/providers/

RUN /opt/keycloak/bin/kc.sh build

# Final
FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION}
COPY --from=keycloak_builder /opt/keycloak/ /opt/keycloak/

ADD --chown=keycloak:keycloak https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar /tmp/opentelemetry-javaagent.jar

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
