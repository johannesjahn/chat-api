# syntax=docker/dockerfile:1

FROM node:24.11.1

RUN apt update && apt upgrade -y

WORKDIR /usr/app

COPY ["./package.json", "./package-lock.json", "./"]
RUN npm ci

COPY ["./tsconfig.json","./tsconfig.build.json", "./nest-cli.json", "./"]
COPY ./src ./src

RUN npm run build
