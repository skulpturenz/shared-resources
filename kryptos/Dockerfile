FROM golang:alpine AS build

WORKDIR /build

COPY . .

RUN go build -o kryptos-exec

FROM scratch

COPY --from=build /build/kryptos-exec /kryptos

ENTRYPOINT [ "/kryptos" ]
