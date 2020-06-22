import hither as hi
import numpy as np
import kachery as ka
from ._correlograms_phy import compute_correlograms

@hi.function('genplot_autocorrelogram', '0.1.0')
def genplot_autocorrelogram(sorting_object, unit_id):
    import matplotlib.pyplot as plt, mpld3
    import labbox_ephys as le

    S = le.LabboxEphysSortingExtractor(sorting_object)

    f = plt.figure(figsize=(2, 2))
    _plot_autocorrelogram(ax=plt.gca(), sorting=S, unit_id=unit_id, window_size_msec=50, bin_size_msec=1)
    return mpld3.fig_to_dict(f)

def _plot_correlogram(*, ax, bin_counts, bins, wid, title='', color=None):
    kk = 1000
    ax.bar(x=(bins-wid/2)*kk, height=bin_counts,
           width=wid*kk, color=color, align='edge')
    ax.set_xlabel('dt (msec)')
    ax.set_xticks([bins[0]*kk, bins[len(bins)//2]*kk, bins[-1]*kk])
    # ax.set_yticks([])


def _plot_autocorrelogram(ax, sorting, unit_id, window_size_msec, bin_size_msec):
    times = sorting.get_unit_spike_train(unit_id=unit_id)
    labels = np.ones(times.shape, dtype=np.int32)
    window_size = window_size_msec / 1000
    bin_size = bin_size_msec / 1000
    C = compute_correlograms(
        spike_times=times/sorting.get_sampling_frequency(),
        spike_clusters=labels,
        cluster_ids=[1],
        bin_size=bin_size,
        window_size=window_size,
        sample_rate=sorting.get_sampling_frequency(),
        symmetrize=True
    )
    bins = np.linspace(- window_size / 2, window_size / 2, C.shape[2])
    _plot_correlogram(ax=ax, bin_counts=C[0, 0, :], bins=bins, wid=bin_size, color='gray')


def _plot_crosscorrelogram(ax, sorting, unit_id1, unit_id2, window_size_msec, bin_size_msec):
    times1 = sorting.get_unit_spike_train(unit_id=unit_id1)
    times2 = sorting.get_unit_spike_train(unit_id=unit_id2)
    times = np.concatenate((times1, times2))
    labels = np.concatenate(
        (np.ones(times1.shape, dtype=np.int32)*1, np.ones(times2.shape, dtype=np.int32)*2))
    inds = np.argsort(times)
    times = times[inds]
    labels = labels[inds]
    window_size = window_size_msec / 1000
    bin_size = bin_size_msec / 1000
    C = compute_correlograms(
        spike_times=times/sorting.get_sampling_frequency(),
        spike_clusters=labels,
        cluster_ids=[1, 2],
        bin_size=bin_size,
        window_size=window_size,
        sample_rate=sorting.get_sampling_frequency(),
        symmetrize=True
    )
    bins = np.linspace(- window_size / 2, window_size / 2, C.shape[2])
    _plot_correlogram(ax=ax, bin_counts=C[0, 1, :], bins=bins, wid=bin_size, color='gray')