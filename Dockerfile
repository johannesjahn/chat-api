# syntax=docker/dockerfile:1

FROM node

WORKDIR /usr/app

COPY ["./", "./"]
RUN yarn install

RUN yarn build
