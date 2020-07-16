import hither as hi
import numpy as np
import kachery as ka
from ._correlograms_phy import compute_correlograms

@hi.function('genplot_autocorrelogram', '0.1.0')
def genplot_autocorrelogram(sorting_object, unit_id):
    import matplotlib.pyplot as plt, mpld3
    import labbox_ephys as le

    S = le.LabboxEphysSortingExtractor(sorting_object)
    bins, bin_counts, bin_size = _get_correlogram_data(sorting=S, unit_id1=unit_id,
        window_size_msec=50, bin_size_msec=1)

    f = plt.figure(figsize=(2, 2))
    _plot_correlogram(ax=plt.gca(), bin_counts=bin_counts, bins=bins, wid=bin_size, color='gray')
    return mpld3.fig_to_dict(f)

@hi.function('genplot_crosscorrelogram', '0.1.0')
def genplot_crosscorrelogram(sorting_object, x_unit_id, y_unit_id, plot_edge_size):
    import matplotlib.pyplot as plt, mpld3
    import labbox_ephys as le

    S = le.LabboxEphysSortingExtractor(sorting_object)
    f = plt.figure(figsize=(plot_edge_size, plot_edge_size))

    bins, bin_counts, bin_size = _get_correlogram_data(sorting=S, unit_id1=x_unit_id,
        unit_id2=y_unit_id, window_size_msec=50, bin_size_msec=1)
    _plot_correlogram(ax=plt.gca(), bin_counts=bin_counts, bins=bins, wid=bin_size, color='gray')

    return mpld3.fig_to_dict(f)

def _plot_correlogram(*, ax, bin_counts, bins, wid, title='', color=None):
    kk = 1000
    ax.bar(x=(bins-wid/2)*kk, height=bin_counts,
           width=wid*kk, color=color, align='edge')
    ax.set_xlabel('dt (msec)')
    ax.set_xticks([bins[0]*kk, bins[len(bins)//2]*kk, bins[-1]*kk])
    # ax.set_yticks([])

@hi.function('fetch_plot_data', '0.1.0')
def fetch_plot_data(sorting_object, unit_x, unit_y):
    import labbox_ephys as le
    S = le.LabboxEphysSortingExtractor(sorting_object)
    data = _get_correlogram_data(sorting=S, unit_id1=unit_x, unit_id2=unit_y,
        window_size_msec=50, bin_size_msec=1)
    return data

def _get_correlogram_data(*, sorting, unit_id1, unit_id2=None, window_size_msec, bin_size_msec):
    auto = unit_id2 is None or unit_id2 == unit_id1

    times = sorting.get_unit_spike_train(unit_id=unit_id1)
    window_size = window_size_msec / 1000
    bin_size = bin_size_msec / 1000
    labels = np.ones(times.shape, dtype=np.int32)
    cluster_ids = [1]
    if not auto:
        times2 = sorting.get_unit_spike_train(unit_id=unit_id2)
        times = np.concatenate((times, times2))
        labels = np.concatenate((labels, np.ones(times2.shape, dtype=np.int32) *2 ))
        cluster_ids.append(2)
        inds = np.argsort(times)
        times = times[inds]
        labels = labels[inds]
    C = compute_correlograms(
        spike_times=times/sorting.get_sampling_frequency(),
        spike_clusters=labels,
        cluster_ids=cluster_ids,
        bin_size=bin_size,
        window_size=window_size,
        sample_rate=sorting.get_sampling_frequency(),
        symmetrize=True
    )
    bins = np.linspace(- window_size / 2, window_size / 2, C.shape[2])
    bin_counts = C[0, 0, :] if auto else C[0, 1, :]
    bin_size_sec = bin_size_msec / 1000
    return bins, bin_counts, bin_size_sec
