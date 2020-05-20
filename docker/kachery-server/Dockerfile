FROM node:12

# #########################################
# ### Clone kachery
RUN git clone https://github.com/flatironinstitute/kachery /kachery \
    && cd /kachery \
    && git checkout 73ebdec452e72eb9da2c2bb3424300a0893d20ac

WORKDIR /kachery/server
RUN npm install

COPY kachery_config_template.json /kachery_config_template.json
COPY run_inside_container.sh /run_inside_container.sh

# Remove the node user -- so it doesn't conflict with the host user
# In the future we will want to let labbox-launcher take care of this situation.
RUN userdel node

EXPOSE 8080
ENTRYPOINT [ "/run_inside_container.sh" ]