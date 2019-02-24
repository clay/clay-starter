FROM node:alpine

# RUN apk add --no-cache \
#     autoconf \
#     automake \
#     bash \
#     g++ \
#     libc6-compat \
#     libjpeg-turbo-dev \
#     libpng-dev \
#     make \
#     nasm

ADD entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
