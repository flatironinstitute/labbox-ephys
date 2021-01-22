from types import SimpleNamespace


class _sorting_views(SimpleNamespace):
    pass

class _recording_views(SimpleNamespace):
    pass

def register_sorting_view(name: str=None):
    def wrap(f):
        name1 = name if name is not None else f.__name__
        setattr(_sorting_views, name1, f)
        return f
    return wrap

def register_recording_view(name: str=None):
    def wrap(f):
        name1 = name if name is not None else f.__name__
        setattr(_recording_views, name1, f)
        return f
    return wrap
