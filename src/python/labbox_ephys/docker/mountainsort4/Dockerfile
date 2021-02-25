FROM ubuntu:18.04

#########################################
### Python                                                               
RUN apt-get update && apt-get -y install git wget build-essential
RUN apt-get install -y python3 python3-pip
### Make sure we have python3 and a working locale
RUN (rm /usr/bin/python || true) && ln -s python3 /usr/bin/python && (rm /usr/bin/pip || true) && ln -s pip3 /usr/bin/pip
ENV LANG='en_US.UTF-8' LANGUAGE='en_US:en' LC_ALL='en_US.UTF-8'
RUN apt-get install -y locales && locale-gen en_US.UTF-8
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y python3-tk

#########################################
RUN pip install numpy

RUN pip install scipy
RUN pip install spikeextractors==0.9.1 spiketoolkit==0.7.0 spikesorters==0.4.2 spikemetrics==0.2.2
RUN pip install requests
RUN pip install h5py

#########################################
RUN pip install ml_ms4alg==0.3.5