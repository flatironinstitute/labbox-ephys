FROM continuumio/miniconda3

WORKDIR /app

# Create the environment:
RUN conda create -n myenv python=3.8

# Make RUN commands use the new environment:
SHELL ["conda", "run", "-n", "myenv", "/bin/bash", "-c"]

RUN conda install -c conda-forge nodejs
RUN npm install -g serve

COPY ./dist/labbox-ephys-0.5.10.tar.gz /labbox-ephys-0.5.10.tar.gz
RUN pip install /labbox-ephys-0.5.10.tar.gz

# Make sure the environment is activated and labbox-ephys is installed
RUN echo "Make sure labbox-ephys is installed:"
RUN python -c "import labbox_ephys"

ENV PYTHONUNBUFFERED=1
COPY ./inside_container/entrypoint.sh /entrypoint.sh
COPY ./inside_container/run.sh /run.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/run.sh"]