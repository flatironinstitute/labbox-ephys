from typing import Union
import os
import random
from types import SimpleNamespace

from labbox_ephys.extractors.labboxephyssortingextractor import LabboxEphysSortingExtractor
import hither as hi
import kachery as ka

@hi.function('mountainsort4', '0.1.6')
@hi.container('docker://magland/sf-mountainsort4:0.3.2')
@hi.local_modules(['../../labbox_ephys'])
def mountainsort4(
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

    with ka.config(fr='labbox_ephys_readonly'):
        recording = le.LabboxEphysRecordingExtractor(recording_object, download=True)

    # for quick testing
    # import spikeextractors as se
    # recording = se.SubRecordingExtractor(parent_recording=recording_object, start_frame=0, end_frame=30000 * 1)
    
    # Preprocessing
    # print('Preprocessing...')
    # recording = st.preprocessing.bandpass_filter(recording_object, freq_min=300, freq_max=6000)
    # recording = st.preprocessing.whiten(recording_object)

    # Sorting
    print('Sorting...')
    sorter = ss.Mountainsort4Sorter(
        recording=recording,
        output_folder='/tmp/tmp_mountainsort4_' + _random_string(8),
        delete_output_folder=True
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

    with hi.TemporaryDirectory() as tmpdir:
        sorting_fname = tmpdir + '/firings.mda'
        le.MdaSortingExtractor.write_sorting(sorting=sorting, save_path=sorting_fname)
        sorting_file = hi.File(sorting_fname)
    return dict(
        sorting_file=sorting_file
    )

def _random_string(num_chars: int) -> str:
    chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return ''.join(random.choice(chars) for _ in range(num_chars))

sorters = SimpleNamespace(
    mountainsort4=mountainsort4
)
