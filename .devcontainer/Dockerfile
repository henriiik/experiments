FROM ubuntu
# FROM alpine

# RUN apk --no-cache add zsh git curl sudo coreutils bash grep dirmngr gpg gawk
RUN apt-get update \
        && apt-get install -y zsh git curl dirmngr gpg gawk \
        && rm -rf /var/lib/apt/lists/* \
        ;

ARG USER=henke
ENV HOME /home/$USER

RUN adduser --shell /bin/zsh $USER \
        && usermod -aG sudo $USER \
        ;

USER $USER
WORKDIR $HOME

RUN git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.9.0
