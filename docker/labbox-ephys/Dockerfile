FROM ubuntu:18.04

#########################################
### Node 12 and yarn
### best to do this before python
RUN apt-get update && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash - && apt-get update && apt-get install -y nodejs
RUN npm install -g yarn

#########################################
### Python                                                               
RUN apt-get update && apt-get -y install git wget build-essential
RUN apt-get install -y python3 python3-pip
### Make sure we have python3 and a working locale
RUN (rm /usr/bin/python || true) && ln -s python3 /usr/bin/python && (rm /usr/bin/pip || true) && ln -s pip3 /usr/bin/pip
ENV LANG='en_US.UTF-8' LANGUAGE='en_US:en' LC_ALL='en_US.UTF-8'
RUN apt-get install -y locales && locale-gen en_US.UTF-8
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y python3-tk

# See: https://blog.miguelgrinberg.com/post/how-to-deploy-a-react--flask-project
##### nginx, etc
RUN apt-get update && apt-get install -y nginx

# nano
RUN apt-get install -y nano

#########################################
RUN pip install numpy

RUN pip install ipython jupyter jupyterlab
RUN pip install pymongo dnspython
RUN pip install flask
RUN pip install python-dotenv simplejson

RUN pip install scipy
RUN pip install spikeextractors==0.7.2 spiketoolkit==0.5.2 spikesorters==0.2.5
RUN pip install requests

RUN pip install gunicorn
RUN yarn global add serve concurrently

RUN pip install bokeh
RUN pip install matplotlib mpld3

# #########################################
# ### Install kachery
RUN git clone https://github.com/flatironinstitute/kachery /kachery \
    && cd /kachery \
    && git checkout 73ebdec452e72eb9da2c2bb3424300a0893d20ac \
    && pip install .

# #########################################
# ### Install hither
RUN git clone https://github.com/flatironinstitute/hither /hither \
    && cd /hither \
    && git checkout 2de9f76e481ecafaee3c2c480ff2242561386f92 \
    && pip install .

RUN yarn global add serve

# #########################################
# ### Install labbox-ephys
# Be selective in which files we copy
# Note that the app bundle needs to be built ahead of time (this helps minimize docker layer disk size)
COPY src /labbox-ephys/src
COPY api /labbox-ephys/api
COPY build /labbox-ephys/build

COPY docker/labbox-ephys/labbox-ephys.nginx /etc/nginx/sites-available/labbox-ephys.nginx
RUN rm /etc/nginx/sites-enabled/default && \
    ln -s /etc/nginx/sites-available/labbox-ephys.nginx /etc/nginx/sites-enabled/labbox-ephys.nginx

COPY docker/labbox-ephys/run_inside_container.sh /run_inside_container.sh

ENV PYTHONPATH=/labbox-ephys/api

EXPOSE 15310

ENTRYPOINT [ "/run_inside_container.sh" ]
