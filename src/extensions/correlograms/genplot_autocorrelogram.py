import os
import hither as hi
import kachery as ka
import numpy as np
import labbox_ephys as le
import spikeextractors as se

from ._correlograms_phy import compute_correlograms


@hi.function('fetch_correlogram_plot_data', '0.2.6')
@hi.container('docker://magland/labbox-ephys-processing:0.3.19')
@hi.local_modules([os.getenv('LABBOX_EPHYS_PYTHON_MODULE_DIR')])
@le.serialize
def fetch_correlogram_plot_data(sorting_object, unit_x, unit_y=None):
    S = le.LabboxEphysSortingExtractor(sorting_object)
    data = _get_correlogram_data(sorting=S, unit_id1=unit_x, unit_id2=unit_y,
        window_size_msec=50, bin_size_msec=1)
    return data

@hi.function('createjob_fetch_correlogram_plot_data', '')
def createjob_fetch_correlogram_plot_data(labbox, sorting_object, unit_x, unit_y=None):
    jh = labbox.get_job_handler('partition1')
    jc = labbox.get_job_cache()
    with hi.Config(
        job_cache=jc,
        job_handler=jh,
        container=jh.is_remote
    ):
        return fetch_correlogram_plot_data.run(
            sorting_object=sorting_object,
            unit_x=unit_x,
            unit_y=unit_y
        )

def _get_spike_train(*, sorting: se.SortingExtractor, unit_id):
    if type(unit_id) == list:
        x = sorting.get_units_spike_train(unit_ids=unit_id)
        return np.sort(np.concatenate(x))
    else:
        return sorting.get_unit_spike_train(unit_id=unit_id)

def _get_correlogram_data(*, sorting, unit_id1, unit_id2=None, window_size_msec, bin_size_msec):
    auto = unit_id2 is None or unit_id2 == unit_id1

    times = _get_spike_train(sorting=sorting, unit_id=unit_id1)
    window_size = window_size_msec / 1000
    bin_size = bin_size_msec / 1000
    labels = np.ones(times.shape, dtype=np.int32)
    cluster_ids = [1]
    if not auto:
        times2 = _get_spike_train(sorting=sorting, unit_id=unit_id2)
        times = np.concatenate((times, times2))
        labels = np.concatenate((labels, np.ones(times2.shape, dtype=np.int32) *2 ))
        cluster_ids.append(2)
        inds = np.argsort(times)
        times = times[inds]
        labels = labels[inds]
    C = compute_correlograms(
        spike_times=times / sorting.get_sampling_frequency(),
        spike_clusters=labels,
        cluster_ids=cluster_ids,
        bin_size=bin_size,
        window_size=window_size,
        sample_rate=sorting.get_sampling_frequency(),
        symmetrize=True
    )
    bins = np.linspace(- window_size_msec / 2, window_size_msec / 2, C.shape[2])
    bin_counts = C[0, 0, :] if auto else C[0, 1, :]
    bin_size_sec = bin_size_msec / 1000
    return {
        'bins': bins.astype(np.float32),
        'bin_counts': bin_counts.astype(np.int16),
        'bin_size_sec': bin_size_sec
    }