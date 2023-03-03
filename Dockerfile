# syntax=docker/dockerfile:1

FROM node:slim as builder

WORKDIR /usr/app

COPY ["./package.json", "./yarn.lock", "./"]
RUN yarn

COPY ["./tsconfig.json","./tsconfig.build.json", "./nest-cli.json", "./"]
COPY ./src ./src

RUN yarn build


FROM node:slim

WORKDIR /usr/app

COPY --from=builder /usr/app/node_modules /usr/app/node_modules
COPY --from=builder /usr/app/dist /usr/app/dist
