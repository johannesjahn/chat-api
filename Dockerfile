# syntax=docker/dockerfile:1

FROM node:22.3.0 as builder

WORKDIR /usr/app

COPY ["./package.json", "./yarn.lock", "./"]
RUN yarn install
RUN yarn add sharp --ignore-engines

COPY ["./tsconfig.json","./tsconfig.build.json", "./nest-cli.json", "./"]
COPY ./src ./src

HEALTHCHECK --interval=30s --timeout=30s --start-period=30s --retries=3 CMD [ "curl localhost:3000/app/debug" ]

RUN yarn build
