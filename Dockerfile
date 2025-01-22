# syntax=docker/dockerfile:1

FROM oven/bun:1.1.45 AS builder
WORKDIR /usr/app

COPY ["./package.json", "./bun.lockb", "./"]
RUN bun install

COPY ["./tsconfig.json","./tsconfig.build.json", "./nest-cli.json", "./"]
COPY ./src ./src

RUN ["bun", "run", "build"]

FROM node:23.8.0 AS runner

WORKDIR /usr/app
COPY --from=builder /usr/app /usr/app
