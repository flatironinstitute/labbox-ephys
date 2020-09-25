# Load this sorting using Python

**See below for prerequisites**

## Loading into a SpikeInterface sorting extractor

```python
import labbox_ephys as le

sorting_path = '<SORTING_PATH>'

sorting = le.LabboxEphysSortingExtractor(sorting_path)

# sorting is a SpikeInterface sorting extractor
# print the unit IDs
unit_ids = sorting.get_unit_ids()
print(f'Unit IDs: {unit_ids}\n')

# get a spike train for the first unit
unit_id = unit_ids[0]
spike_train = sorting.get_unit_spike_train(unit_id=unit_id)
print(f'Unit {unit_id} has {len(spike_train)} events\n')
```

## Prerequisites

### kachery-p2p daemon

In order to retrieve the data from the distributed network you must have a kachery-p2p daemon running
and be connected to the appropriate channel. See [kachery-p2p](https://github.com/flatironinstitute/kachery-p2p).


### Labbox-ephys Python package

Install the labbox-ephys Python package from source

```bash
git clone https://github.com/laboratorybox/labbox-ephys
cd labbox-ephys/python
pip install -e .
```

For subsequent updates:

```bash
cd labbox-ephys
git pull
cd python
pip install -e .
```

