FROM ubuntu:latest

RUN apt-get update -y 

RUN apt-get install -y \
    wget \
    ninja-build \
    meson \
    docbook-xsl \
    xsltproc \
    build-essential \
    libmicrohttpd-dev \
    libjansson-dev \
    libnice-dev \
    libssl-dev \
    libconfig-dev \
    libsofia-sip-ua-dev \
    libglib2.0-dev \
    libopus-dev \
    libogg-dev \
    libini-config-dev \
    libcollection-dev \
    pkg-config \
    gengetopt \
    libtool \
    autotools-dev \
    automake

RUN apt-get install -y \
    sudo \
    make \
    git \
    doxygen \
    graphviz \
    cmake

RUN cd ~ \
    && wget https://github.com/cisco/libsrtp/archive/v2.2.0.tar.gz \
    && tar xfv v2.2.0.tar.gz \
    && cd libsrtp-2.2.0 \
    && ./configure --prefix=/usr --enable-openssl \
    && make shared_library \
    && sudo make install

RUN cd ~ \
    && git clone https://github.com/sctplab/usrsctp \
    && cd usrsctp \
    && ./bootstrap \
    && ./configure --prefix=/usr --disable-programs --disable-inet --disable-inet6 \
    && make \
    && sudo make install

RUN cd ~ \
    && git clone https://libwebsockets.org/repo/libwebsockets \
    && cd libwebsockets \
    && git checkout v4.3-stable \
    && mkdir build \
    && cd build \
    && cmake -DLWS_MAX_SMP=1 -DLWS_WITHOUT_EXTENSIONS=0 -DCMAKE_INSTALL_PREFIX:PATH=/usr -DCMAKE_C_FLAGS="-fpic" .. \
    && make \
    && sudo make install

RUN cd ~ \
    && wget https://download.gnome.org/sources/glib/2.70/glib-2.70.0.tar.xz \
    && tar xfv glib-2.70.0.tar.xz \
    && cd glib-2.70.0 \
    && mkdir build \
    && cd build \
    && meson setup .. \
      --prefix=/usr       \
      --buildtype=release \
      -Dman=true \         
       && ninja

RUN cd ~ \
    && git clone https://github.com/meetecho/janus-gateway.git \
    && cd janus-gateway \
    && sh autogen.sh \
    && ./configure --prefix=/opt/janus --disable-rabbitmq --disable-mqtt --enable-docs \
    && make CFLAGS='-std=c99' \
    && make install \
    && make configs

COPY janus_gateway/conf/*.jcfg /opt/janus/etc/janus/

EXPOSE 7088 8088 8188 8089
EXPOSE 10000-10200/udp

CMD /opt/janus/bin/janus --nat-1-1=${DOCKER_IP}