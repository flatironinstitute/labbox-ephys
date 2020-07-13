import hither as hi

@hi.function('react_vis_test_2', '0.1.0')
def react_vis_test_2(a):
    # prepare some data
    x = [1, 2, 3, 4, 5, a]
    y = [6, 7, 2, 4, 5, a * 2]

    return [
        {'x': x[i], 'y': y[i]}
        for i in range(len(x))
    ]