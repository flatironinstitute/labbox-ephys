import traceback
import hither as hi
import kachery as ka

@hi.function('get_franklab_datajoint_importable_recordings', '0.1.0')
def get_franklab_datajoint_importable_recordings(config):
    import labbox_ephys as le

    import datajoint as dj
    dj.config['enable_python_native_blobs'] = True
    dj.config['database.port'] = config['port']
    dj.config['database.user'] = config['user']
    dj.config['database.password'] = config['password']

    from .schema import common_session

    ret = []
    for s in common_session.Session():
        nwb_file_name = s['nwb_file_name']
        try:
            recording = le.LabboxEphysRecordingExtractor(nwb_file_name)
            recording_object = recording.object()
        except:
            traceback.print_exc()
            print(f'Warning: problem loading recording: {path}')
            recording_object = None
        if recording_object is not None:
            info = le.get_recording_info(recording_object)
            path2 = ka.store_file(nwb_file_name)
            ret.append(dict(
                label=nwb_file_name,
                path=path2,
                recording_object=recording_object,
                recording_info=info
            ))
    return ret