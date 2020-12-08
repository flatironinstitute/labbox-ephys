from types import SimpleNamespace


class sorting_views(SimpleNamespace):
    pass

class recording_views(SimpleNamespace):
    pass

def register_sorting_view(name: str=None):
    def wrap(f):
        name1 = name if name is not None else f.__name__
        setattr(sorting_views, name1, f)
        return f
    return wrap

def register_recording_view(name: str=None):
    def wrap(f):
        name1 = name if name is not None else f.__name__
        setattr(recording_views, name1, f)
        return f
    return wrap
