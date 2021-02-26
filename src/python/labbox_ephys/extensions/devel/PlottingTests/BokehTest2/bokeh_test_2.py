import hither as hi

@hi.function('bokeh_test_2', '0.1.0')
def bokeh_test_2():
    from bokeh.embed import json_item
    from bokeh.plotting import figure

    # prepare some data
    x = [1, 2, 3, 4, 5]
    y = [6, 7, 2, 4, 5]

    # create a new plot with a title and axis labels
    p = figure(title=f"Bokeh test", x_axis_label='x', y_axis_label='y')

    # add a line renderer with legend and line thickness
    p.line(x, y, legend_label="Temp.", line_width=2)

    return json_item(p)