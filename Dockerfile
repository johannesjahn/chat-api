# syntax=docker/dockerfile:1

FROM node

WORKDIR /usr/app

COPY ["package.json", "yarn.lock", "./"]

RUN yarn install

COPY . ./

RUN yarn build
