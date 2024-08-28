FROM golang:alpine

COPY . .
RUN go install

ENTRYPOINT ["authnz-service-proxy"]
