# syntax=docker/dockerfile:1

FROM node:22.4.1-slim

WORKDIR /usr/app

COPY ["./package.json", "./package-lock.json", "./"]
RUN npm ci

COPY ["./tsconfig.json","./tsconfig.build.json", "./nest-cli.json", "./"]
COPY ./src ./src

RUN npm run build
