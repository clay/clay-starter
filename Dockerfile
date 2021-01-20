# syntax=docker/dockerfile:experimental
FROM node:12

WORKDIR /usr/local/src/
COPY app/ ./
RUN --mount=type=ssh npm i
