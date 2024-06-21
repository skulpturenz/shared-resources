FROM golang:alpine as base

VOLUME . .
RUN go install

ENTRYPOINT ["secrets"]