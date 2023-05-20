#FROM ubuntu:latest
FROM nvidia/cuda:11.8.0-devel-ubuntu22.04

# Golang variables
ARG GO_VERSION
ARG API_KEY
ARG GO_ENV
ARG GO_PORT

# MongoDB variables
ARG MONGO_PORT
ARG MONGO_IP
ARG MONGO_USER
ARG MONGO_PASSWORD

ENV TZ=Europe/Amsterdam
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install essential packages
RUN apt update
RUN apt install software-properties-common -y
RUN add-apt-repository ppa:deadsnakes/ppa
RUN apt-get update && \
    apt-get install -y curl git openssh-server python3-pip


RUN apt-get install -y ffmpeg libsm6 libxext6 zlib1g-dev libncurses5-dev libgdbm-dev libnss3-dev libssl-dev libreadline-dev libffi-dev libsqlite3-dev libbz2-dev lzma libgl1-mesa-glx liblzma-dev

# Update package lists and install Python 3.9
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y python3.9 python3.9-dev python3.9-distutils && \
    update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.9 1 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Add Python 3.9 to the PATH
ENV PATH="/usr/bin/python3.9:${PATH}"

RUN pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
RUN pip install opencv-python ultralytics aiortc aiohttp websockets
RUN pip install matplotlib numpy Pillow PyYAML requests scipy tqdm pandas seaborn

# Set environment variables
ENV GOPATH=$HOME/go
ENV PATH=$PATH:/usr/local/go/bin:$GOPATH/bin

# Add environment variable settings to .profile
RUN echo 'export GOPATH=$HOME/go' >> ~/.profile && \
    echo 'export PATH=$PATH:/usr/local/go/bin:$GOPATH/bin' >> ~/.profile

# Download and install Golang
RUN curl -O https://dl.google.com/go/go${GO_VERSION}.linux-amd64.tar.gz && \
    tar -C /usr/local -xzf go${GO_VERSION}.linux-amd64.tar.gz && \
    rm go${GO_VERSION}.linux-amd64.tar.gz

# Install SSH server
RUN mkdir /var/run/sshd && \
    echo 'root:password' | chpasswd && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Create startup script
RUN echo "#!/bin/bash" > /startup.sh && \
    echo "service ssh start" >> /startup.sh && \
    echo "cd /app" >> /startup.sh && \
    echo "rm .env" >> /startup.sh && \
    echo "mkdir -p /root/.cache/torch/hub" >> /startup.sh && \
    echo "touch /root/.cache/torch/hub/requirements.txt" >> /startup.sh && \
    echo "touch /usr/local/lib/python3.9/dist-packages/requirements.txt" >> /startup.sh && \
    echo 'echo "# APP DEVELOPMENT ENV" >> .env' >> /startup.sh && \
    echo "echo 'GO_PORT = $GO_PORT' >> .env" >> /startup.sh && \
    echo "echo 'GO_ENV = $GO_ENV' >> .env" >> /startup.sh && \
    echo 'echo "" >> .env' >> /startup.sh && \
    echo 'echo "# API KEY" >> .env' >> /startup.sh && \
    echo "echo 'API_KEY = $API_KEY' >> .env" >> /startup.sh && \
    echo 'echo "" >> .env' >> /startup.sh && \
    echo 'echo "# MONGODB" >> .env' >> /startup.sh && \
    echo "echo 'MONGODB_URL = mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}' >> .env" >> /startup.sh && \
    echo "go build -o paddle_app" >> /startup.sh && \
    echo "exec ./paddle_app" >> /startup.sh && \
    chmod +x /startup.sh

# Expose port
EXPOSE 8081

# Run startup script
CMD ["/startup.sh"]