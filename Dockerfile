# syntax=docker/dockerfile:1

FROM node

WORKDIR /usr/app

COPY ["package.json", "yarn.lock", ".env", ".dev.env", "./"]
RUN yarn install

COPY ./dist ./dist
