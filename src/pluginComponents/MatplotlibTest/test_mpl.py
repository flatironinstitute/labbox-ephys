import hither2 as hi

@hi.function('test_mpl', '0.1.0')
def test_mpl():
    import matplotlib.pyplot as plt, mpld3
    f = plt.figure(figsize=(4, 4))
    plt.plot([3,1,4,1,5], 'ks-', mec='w', mew=5, ms=20)
    ret = mpld3.fig_to_dict(f)
    print(ret)
    return ret
