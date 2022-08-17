#!/bin/bash
rm -rf linux/*
docker build . -t chat
docker run -td --name chat_build chat
docker cp -a chat_build:/usr/app/dist linux 
docker cp -a chat_build:/usr/app/node_modules linux 
docker stop chat_build
docker rm chat_build
docker image rm chat

