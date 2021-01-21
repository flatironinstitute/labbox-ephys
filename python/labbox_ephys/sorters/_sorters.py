from typing import Union
import numpy as np
import os
import random
from types import SimpleNamespace

from labbox_ephys.extractors.labboxephyssortingextractor import LabboxEphysSortingExtractor
import hither as hi
import kachery as ka

@hi.function('mountainsort4b', '0.1.6')
@hi.container('docker://magland/labbox-ephys-mountainsort4:0.3.5')
@hi.local_modules([os.getenv('LABBOX_EPHYS_PYTHON_MODULE_DIR')])
def mountainsort4b(
    recording_object: dict,
    detect_sign=-1,
    adjacency_radius=50,
    clip_size=50,
    detect_threshold=3,
    detect_interval=10,
    freq_min=300,
    freq_max=6000,
    whiten=True,
    curation=False,
    filter=True
):
    # Unfortunately we need to duplicate wrapper code from spikeforest2 due to trickiness in running code in containers. Will need to think about this
    # import spiketoolkit as st
    import spikesorters as ss
    import labbox_ephys as le

    recording = le.LabboxEphysRecordingExtractor(recording_object)

    # for quick testing
    # import spikeextractors as se
    # recording = se.SubRecordingExtractor(parent_recording=recording_object, start_frame=0, end_frame=30000 * 1)
    
    # Preprocessing
    # print('Preprocessing...')
    # recording = st.preprocessing.bandpass_filter(recording_object, freq_min=300, freq_max=6000)
    # recording = st.preprocessing.whiten(recording_object)

    # Sorting
    print('Sorting...')
    with hi.TemporaryDirectory() as tmpdir:
        sorter = ss.Mountainsort4Sorter(
            recording=recording,
            output_folder=tmpdir,
            delete_output_folder=False
        )

        num_workers = os.environ.get('NUM_WORKERS', None)
        if num_workers:
            num_workers = int(num_workers)
        else:
            num_workers = 0

        sorter.set_params(
            detect_sign=detect_sign,
            adjacency_radius=adjacency_radius,
            clip_size=clip_size,
            detect_threshold=detect_threshold,
            detect_interval=detect_interval,
            num_workers=num_workers,
            curation=curation,
            whiten=whiten,
            filter=filter,
            freq_min=freq_min,
            freq_max=freq_max
        )     
        timer = sorter.run()
        print('#SF-SORTER-RUNTIME#{:.3f}#'.format(timer))
        sorting = sorter.get_result()
        sorting_object = _create_sorting_object(sorting)
        return dict(
            sorting_object=sorting_object
        )

def _create_sorting_object(sorting):
    unit_ids = sorting.get_unit_ids()
    times_list = []
    labels_list = []
    for i in range(len(unit_ids)):
        unit = unit_ids[i]
        times = sorting.get_unit_spike_train(unit_id=unit)
        times_list.append(times)
        labels_list.append(np.ones(times.shape) * unit)
    all_times = np.concatenate(times_list)
    all_labels = np.concatenate(labels_list)
    sort_inds = np.argsort(all_times)
    all_times = all_times[sort_inds]
    all_labels = all_labels[sort_inds]
    times_npy_uri = ka.store_npy(all_times)
    labels_npy_uri = ka.store_npy(all_labels)
    return dict(
        sorting_format='npy1',
        data=dict(
            times_npy_uri=times_npy_uri,
            labels_npy_uri=labels_npy_uri,
            samplerate=30000
        )
    )

def _random_string(num_chars: int) -> str:
    chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return ''.join(random.choice(chars) for _ in range(num_chars))

sorters = SimpleNamespace(
    mountainsort4=mountainsort4b
)
