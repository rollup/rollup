FROM node:latest
LABEL authors="lukastaegert"

# Compile arm-linux-musleabihf-gcc
# This can take a small eternity
RUN apt-get update &&\
    apt-get install -y build-essential wget &&\
    wget https://github.com/richfelker/musl-cross-make/archive/master.tar.gz &&\
    tar xzf master.tar.gz &&\
    rm master.tar.gz &&\
    cd musl-cross-make-master &&\
    echo "TARGET=arm-linux-musleabihf\\nOUTPUT=/usr/local" > config.mak &&\
    make &&\
    make install &&\
    cd .. &&\
    rm -rf musl-cross-make-master

# Install rustup with correct target
RUN wget -q -O - https://sh.rustup.rs | sh -s -- -y &&\
    . "$HOME/.cargo/env" &&\
    rustup target add armv7-unknown-linux-musleabihf

ENV PATH="${PATH}:/root/.cargo/bin"
