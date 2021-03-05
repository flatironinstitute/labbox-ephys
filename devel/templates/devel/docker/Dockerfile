FROM continuumio/miniconda3

WORKDIR /app

# Create the environment:
RUN conda create -n myenv python=3.8

# Make RUN commands use the new environment:
SHELL ["conda", "run", "-n", "myenv", "/bin/bash", "-c"]

RUN conda install -c conda-forge nodejs
RUN npm install -g serve

COPY ./dist/{{ projectName }}-{{ projectVersion }}.tar.gz /{{ projectName }}-{{ projectVersion }}.tar.gz
RUN pip install /{{ projectName }}-{{ projectVersion }}.tar.gz

# Make sure the environment is activated and {{ projectName }} is installed
RUN echo "Make sure {{ projectName }} is installed:"
RUN python -c "import {{ projectNameUnderscore }}"

ENV PYTHONUNBUFFERED=1
COPY ./inside_container/entrypoint.sh /entrypoint.sh
COPY ./inside_container/run.sh /run.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/run.sh"]