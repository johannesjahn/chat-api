# syntax=docker/dockerfile:1

FROM node

WORKDIR /usr/app

COPY ["./package.json", "./yarn.lock", "./"]
RUN yarn

COPY ["./tsconfig.json","./tsconfig.build.json", "./nest-cli.json", "./"]
COPY ./src ./src

RUN yarn build
