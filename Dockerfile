# syntax=docker/dockerfile:1

FROM oven/bun:1.1.45

WORKDIR /usr/app

COPY ["./package.json", "./bun.lockb", "./"]
RUN bun install 

COPY ["./tsconfig.json","./tsconfig.build.json", "./nest-cli.json", "./"]
COPY ./src ./src

RUN bun run build
