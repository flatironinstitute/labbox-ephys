import os
import traceback
import hither as hi
import kachery as ka


@hi.function('get_franklab_datajoint_importable_recordings', '0.1.0')
def get_franklab_datajoint_importable_recordings(config):
    import labbox_ephys as le

    os.environ['DJ_SUPPORT_FILEPATH_MANAGEMENT'] = 'TRUE'
    import datajoint as dj
    dj.config['enable_python_native_blobs'] = True
    dj.config['database.port'] = config['port']
    dj.config['database.user'] = config['user']
    dj.config['database.password'] = config['password']

    # must config dj prior to importing
    import nwb_datajoint as nwbdj

    ret = []
    for session in nwbdj.Session():
        nwb_file_sha1 = session['nwb_file_sha1']
        nwb_file_name = session['nwb_file_name']
        nwb_path = f'sha1://{nwb_file_sha1}/file.nwb'
        try:
            recording = le.LabboxEphysRecordingExtractor(nwb_path)
            recording_object = recording.object()
        except:
            traceback.print_exc()
            print(f'Warning: problem loading recording: {nwb_path}')
            recording_object = None
        if recording_object is not None:
            info = le.get_recording_info(recording_object)
            ret.append(dict(
                label=nwb_file_name,
                path=nwb_path,
                recording_object=recording_object,
                recording_info=info
            ))
    return ret
