# Instructions for Franklab

## Prerequisites

* Python >= 3.7

* Python packages:
```
kachery kachery-p2p hither spikeextractors h5py numpy scipy
```



## Install labbox-ephys from source

```bash
git clone https://github.com/laboratorybox/labbox-ephys
cd labbox-ephys
cd python
pip install -e .
```

For subsequent updates

```bash
cd labbox-ephys
git pull
cd python
pip install -e .
```

## Example create snippets.h5 file

See: [example_for_franklab.py](./example_for_franklab.py)