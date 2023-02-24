FROM nvidia/cuda:11.7.1-cudnn8-devel-ubuntu22.04

ENV TZ=Europe/Amsterdam
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install essential packages
RUN apt update
RUN apt install software-properties-common -y
RUN add-apt-repository ppa:deadsnakes/ppa
RUN apt-get update && \
    apt-get install -y curl git openssh-server python3-pip

# Update package lists and install Python 3.9
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y python3.9 python3.9-dev python3.9-distutils && \
    update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.9 1 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Add Python 3.9 to the PATH
ENV PATH="/usr/bin/python3.9:${PATH}"

RUN apt-get update
RUN pip3 install torch torchvision torchaudio

# Set environment variables
ENV GO_VERSION=1.20

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

## nog iets verzinnen voor go builden auto
#CMD ["go build"]

# Expose port
EXPOSE 8080
# Run the Go application
CMD ["./app"]

#install ssh-server
RUN mkdir /var/run/sshd && \
    echo 'root:password' | chpasswd && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

CMD ["/usr/sbin/sshd", "-D"]