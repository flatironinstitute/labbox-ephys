import loggery as lo

def test_1():
    esc = lo.EventStreamClient(
        url='http://localhost:26001',
        channel='readwrite',
        password='readwrite',
    )
    S = esc.get_stream(stream_id=dict(test=1))
    S.read_events()
    S.write_event(dict(event=1))
    S.write_event(dict(event=2))
    x = S.read_events()
    assert len(x) == 2
    print(x)