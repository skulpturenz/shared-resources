ARG KEYCLOAK_VERSION

FROM node:lts-alpine AS theme_builder

WORKDIR /build

COPY --from=theme . .

RUN apk add maven && corepack enable pnpm && pnpm config set store-dir /home/node/.local/share/pnpm/store
RUN corepack pnpm build-keycloak-theme

FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION} as keycloak_builder

ARG KEYCLOAK_CACHE
ARG KEYCLOAK_CACHE_STACK
ARG KEYCLOAK_FEATURES
ARG KEYCLOAK_DB

# Enable health and metrics support
ENV KC_HEALTH_ENABLED true
ENV KC_METRICS_ENABLED true

ENV KC_CACHE $KEYCLOAK_CACHE
ENV KC_CACHE_STACK $KEYCLOAK_CACHE_STACK
ENV KC_FEATURES $KEYCLOAK_FEATURES
ENV KC_DB $KEYCLOAK_DB

WORKDIR /opt/keycloak

COPY --from=theme_builder /build/dist_keycloak/keycloak-theme-for-kc-25-and-above.jar /opt/keycloak/providers/

RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:${KEYCLOAK_VERSION}
COPY --from=keycloak_builder /opt/keycloak/ /opt/keycloak/

ADD --chown=keycloak:keycloak https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar /tmp/opentelemetry-javaagent.jar

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]