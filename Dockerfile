FROM node:12

WORKDIR /usr/local/src/
COPY app/ ./
RUN npm i
