# Labbox-ephys

## Information for developers

### Ports

In development container:

* 15301 - development client (yarn start)
* 15302 - development api server (flask `api/`)
* 15303 - test production client (serving `build/` directory)
* 15304 - test production api server (gunicorn flask `api/`)
* 15305 - test production nginx server

In deployed production container:

* 15306 - client (serving `build/` directory)
* 15307 - server (gunicorn flask `api/`)
* 15308 - nginx server

