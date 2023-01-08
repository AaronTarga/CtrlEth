FROM mythril/myth

RUN myth version

FROM ubuntu:focal

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

ARG DEBIAN_FRONTEND=noninteractive

RUN  apt-get update \
  # dependencies for building Python packages
  && apt-get install -y build-essential curl wget libssl-dev software-properties-common


RUN  add-apt-repository -y ppa:ethereum/ethereum \
  && apt-get install -y solc

#installing python and its dependencies needed for some python libraries
RUN add-apt-repository -y ppa:deadsnakes/ppa \
  && apt install -y python3.10 python3.10-venv python3.10-dev

#set up signatures.db needed for mythril python library
RUN mkdir -p ~/.mythril
RUN cd ~/.mythril
RUN wget -O signatures.db https://github.com/ConsenSys/mythril/blob/develop/mythril/support/assets/signatures.db?raw=true
RUN cd /

RUN wget -qO- https://bootstrap.pypa.io/get-pip.py | python3.10

RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN rustup default nightly

#setting up venv for installation
ENV VIRTUAL_ENV=/opt/venv
RUN python3.10 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

COPY ./requirements.txt /
RUN pip install -r /requirements.txt

RUN myth version

COPY ./entrypoint ./
RUN sed -i 's/\r$//g' /entrypoint
RUN chmod +x /entrypoint

COPY ./start ./
RUN sed -i 's/\r$//g' /start
RUN chmod +x /start

COPY ./start-celeryworker ./
RUN sed -i 's/\r$//g' /start-celeryworker
RUN chmod +x /start-celeryworker

WORKDIR /app

ENTRYPOINT ["/entrypoint"]