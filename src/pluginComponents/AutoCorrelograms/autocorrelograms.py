import hither2 as hi

@hi.function('test_mpl', '0.1.0')
def test_mpl():
    import matplotlib.pyplot as plt, mpld3
    f = plt.figure(figsize=(4, 4))
    plt.plot([3,1,4,1,5], 'ks-', mec='w', mew=5, ms=20)
    ret = mpld3.fig_to_dict(f)
    print(ret)
    return ret

# def _plot_correlogram(*, bin_counts, bins, wid, title='', color=None):
#     import matplotlib.pyplot as plt
#     ax = plt.gca()
#     kk = 1000
#     ax.bar(x=(bins-wid/2)*kk, height=bin_counts,
#            width=wid*kk, color=color, align='edge')
#     ax.set_xlabel('dt (msec)')
#     ax.set_xticks([bins[0]*kk, bins[len(bins)//2]*kk, bins[-1]*kk])
#     # ax.set_yticks([])


# def plot_autocorrelogram(sorting, unit_id, window_size_msec, bin_size_msec):
#     times = sorting.get_unit_spike_train(unit_id=unit_id)
#     labels = np.ones(times.shape, dtype=np.int32)
#     window_size = window_size_msec / 1000
#     bin_size = bin_size_msec / 1000
#     C = compute_correlograms(
#         spike_times=times/sorting.get_sampling_frequency(),
#         spike_clusters=labels,
#         cluster_ids=[1],
#         bin_size=bin_size,
#         window_size=window_size,
#         sample_rate=sorting.get_sampling_frequency(),
#         symmetrize=True
#     )
#     bins = np.linspace(- window_size / 2, window_size / 2, C.shape[2])
#     _plot_correlogram(bin_counts=C[0, 0, :], bins=bins, wid=bin_size, color='gray')


# def plot_crosscorrelogram(sorting, unit_id1, unit_id2, window_size_msec, bin_size_msec):
#     times1 = sorting.get_unit_spike_train(unit_id=unit_id1)
#     times2 = sorting.get_unit_spike_train(unit_id=unit_id2)
#     times = np.concatenate((times1, times2))
#     labels = np.concatenate(
#         (np.ones(times1.shape, dtype=np.int32)*1, np.ones(times2.shape, dtype=np.int32)*2))
#     inds = np.argsort(times)
#     times = times[inds]
#     labels = labels[inds]
#     window_size = window_size_msec / 1000
#     bin_size = bin_size_msec / 1000
#     C = compute_correlograms(
#         spike_times=times/sorting.get_sampling_frequency(),
#         spike_clusters=labels,
#         cluster_ids=[1, 2],
#         bin_size=bin_size,
#         window_size=window_size,
#         sample_rate=sorting.get_sampling_frequency(),
#         symmetrize=True
#     )
#     bins = np.linspace(- window_size / 2, window_size / 2, C.shape[2])
#     _plot_correlogram(bin_counts=C[0, 1, :], bins=bins, wid=bin_size, color='gray')