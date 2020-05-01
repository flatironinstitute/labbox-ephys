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
RUN pip install pymongo
RUN pip install flask
RUN pip install python-dotenv simplejson

RUN pip install scipy
RUN pip install spikeextractors==0.8.2
RUN pip install requests

RUN pip install gunicorn
RUN yarn global add serve concurrently

# #########################################
# ### Install kachery
RUN git clone https://github.com/flatironinstitute/kachery /kachery \
    && cd /kachery \
    && git checkout 73ebdec452e72eb9da2c2bb3424300a0893d20ac \
    && pip install .

# #########################################
# ### Install hither2
RUN git clone https://github.com/laboratorybox/hither2 /hither2 \
    && cd /hither2 \
    && git checkout 5af6e907e122d41c8835dfaeddb4f489c720a9cd \
    && pip install .

RUN yarn global add serve

# #########################################
# ### Install labbox-ephys
RUN git clone https://github.com/laboratorybox/labbox-ephys /labbox-ephys \
    && cd /labbox-ephys \
    && git checkout aa96aa8146544de296a3a4c1435ebe8d6a7d90f9 \
    && yarn install \
    && yarn build \
    && rm -rf node_modules

COPY labbox-ephys.nginx /etc/nginx/sites-available/labbox-ephys.nginx
RUN rm /etc/nginx/sites-enabled/default && \
    ln -s /etc/nginx/sites-available/labbox-ephys.nginx /etc/nginx/sites-enabled/labbox-ephys.nginx

COPY run_inside_container.sh /run_inside_container.sh

EXPOSE 8080

ENTRYPOINT [ "/run_inside_container.sh" ]
