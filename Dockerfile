# syntax=docker/dockerfile:1

FROM node:22.3.0-slim as builder

WORKDIR /usr/app

COPY ["./package.json", "./yarn.lock", "./"]
RUN yarn install
RUN yarn add sharp --ignore-engines

COPY ["./tsconfig.json","./tsconfig.build.json", "./nest-cli.json", "./"]
COPY ./src ./src

RUN yarn build
