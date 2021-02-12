import hither as hi
import kachery as ka
import spikeextractors as se
import numpy as np

from ..extractors import LabboxEphysRecordingExtractor, H5SortingExtractorV1

@hi.function('spykingcircus', '0.1.0')
def spykingcircus(*,
    recording_object,
    detect_sign=-1,
    adjacency_radius=100,
    detect_threshold=6,
    template_width_ms=3,
    filter=True,
    merge_spikes=True,
    auto_merge=0.75,
    num_workers=None,
    whitening_max_elts=1000,
    clustering_max_elts=10000
):
    import spikesorters as ss

    recording = LabboxEphysRecordingExtractor(recording_object)

    sorting_params = ss.get_default_params('spykingcircus')
    sorting_params['detect_sign'] = detect_sign
    sorting_params['adjacency_radius'] = adjacency_radius
    sorting_params['detect_threshold'] = detect_threshold
    sorting_params['template_width_ms'] = template_width_ms
    sorting_params['filter'] = filter
    sorting_params['merge_spikes'] = merge_spikes
    sorting_params['auto_merge'] = auto_merge
    sorting_params['num_workers'] = num_workers
    sorting_params['whitening_max_elts'] = whitening_max_elts
    sorting_params['clustering_max_elts'] = clustering_max_elts
    print('Using sorting parameters:', sorting_params)
    with hi.TemporaryDirectory() as tmpdir:
        sorting = ss.run_spykingcircus(recording, output_folder=tmpdir + '/sc_output', delete_output_folder=False, verbose=True, **sorting_params)
        h5_output_fname = tmpdir + '/sorting.h5'
        H5SortingExtractorV1.write_sorting(sorting=sorting, save_path=h5_output_fname)
        return {
            'sorting_format': 'h5_v1',
            'data': {
                'h5_path': ka.store_file(h5_output_fname)
            }
        }