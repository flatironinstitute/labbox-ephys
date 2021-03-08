def _jupyter_nbextension_paths():
    return [{
        'section': 'notebook',
        'src': 'nbextension/static',
        'dest': 'labbox_ephys_widgets_jp',
        'require': 'labbox_ephys_widgets_jp/extension'
    }]
