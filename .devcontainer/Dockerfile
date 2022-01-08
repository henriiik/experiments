FROM ubuntu

ENV LANG C.UTF-8

RUN apt-get update \
        && apt-get install -y \
        curl \
        dirmngr \
        gawk \
        git \
        gpg \
        sudo \
        zsh \
        tar \
        unzip \
        && rm -rf /var/lib/apt/lists/* \
        ;

ARG USER=henke
ENV HOME /home/$USER

RUN adduser --shell /bin/zsh $USER \
        && echo "$USER ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/$USER \
        && chmod 0440 /etc/sudoers.d/$USER \
        ;

USER $USER
WORKDIR $HOME
RUN echo '# disable zsh-newuser-install' > .zshrc

COPY ./install-asdf.sh ./install-asdf.sh
COPY ./install-deps.sh ./install-deps.sh

RUN ./install-asdf.sh
