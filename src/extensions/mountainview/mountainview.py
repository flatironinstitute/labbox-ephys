import os
from typing import Union
import labbox_ephys as le
import hither as hi
import kachery_p2p as kp


@le.register_sorting_view(name='MVSortingView')
def MVSortingView(*, sorting: le.LabboxEphysSortingExtractor, recording: le.LabboxEphysRecordingExtractor, curation_subfeed: Union[kp.Subfeed, None]=None, height: float=0):
    import labbox_ephys_widgets_jp as lew
    return lew.create_sorting_view('MVSortingView', sorting=sorting, recording=recording, curation_subfeed=curation_subfeed, height=height)

###################################################################################
# preload_check_sorting_downloaded
@hi.function('preload_check_sorting_downloaded', '0.1.0')
def preload_check_sorting_downloaded(labbox, sorting_object):
    jh = labbox.get_job_handler('partition1')
    with hi.Config(
        job_handler=jh,
        container=jh.is_remote
    ):
        return preload_check_sorting_downloaded_2.run(sorting_object=sorting_object)

@hi.function('preload_check_sorting_downloaded_2', '0.1.0')
@hi.container('docker://magland/labbox-ephys-processing:0.3.19')
@hi.local_modules([os.getenv('LABBOX_EPHYS_PYTHON_MODULE_DIR')])
def preload_check_sorting_downloaded_2(sorting_object):
    import kachery_p2p as kp
    try:
        kp._experimental_config(nop2p=True)
        X = le.LabboxEphysSortingExtractor(sorting_object)
    except:
        return {'isLocal': False}
    finally:
        kp._experimental_config(nop2p=False)
    return {'isLocal': True}

###################################################################################
# preload_download_sorting
@hi.function('preload_download_sorting', '0.1.0')
def preload_download_sorting(labbox, sorting_object):
    jh = labbox.get_job_handler('partition1')
    with hi.Config(
        job_handler=jh,
        container=jh.is_remote
    ):
        return preload_download_sorting_2.run(sorting_object=sorting_object)

@hi.function('preload_download_sorting_2', '0.1.0')
@hi.container('docker://magland/labbox-ephys-processing:0.3.19')
@hi.local_modules([os.getenv('LABBOX_EPHYS_PYTHON_MODULE_DIR')])
def preload_download_sorting_2(sorting_object):
    import kachery_p2p as kp
    try:
        X = le.LabboxEphysSortingExtractor(sorting_object)
    except:
        return {'success': False}
    return {'success': True}
    
###################################################################################
# preload_check_recording_downloaded
@hi.function('preload_check_recording_downloaded', '0.1.0')
def preload_check_recording_downloaded(labbox, recording_object):
    jh = labbox.get_job_handler('partition1')
    with hi.Config(
        job_handler=jh,
        container=jh.is_remote
    ):
        return preload_check_recording_downloaded_2.run(recording_object=recording_object)

@hi.function('preload_check_recording_downloaded_2', '0.1.0')
@hi.container('docker://magland/labbox-ephys-processing:0.3.19')
@hi.local_modules([os.getenv('LABBOX_EPHYS_PYTHON_MODULE_DIR')])
def preload_check_recording_downloaded_2(recording_object):
    import kachery_p2p as kp
    try:
        kp._experimental_config(nop2p=True)
        X = le.LabboxEphysRecordingExtractor(recording_object, download=False)
    except:
        return {'isLocal': False}
    finally:
        kp._experimental_config(nop2p=False)
    return {'isLocal': True}

###################################################################################
# preload_download_recording
@hi.function('preload_download_recording', '0.1.0')
def preload_download_recording(labbox, recording_object):
    jh = labbox.get_job_handler('partition1')
    with hi.Config(
        job_handler=jh,
        container=jh.is_remote
    ):
        return preload_download_recording_2.run(recording_object=recording_object)

@hi.function('preload_download_recording_2', '0.1.0')
@hi.container('docker://magland/labbox-ephys-processing:0.3.19')
@hi.local_modules([os.getenv('LABBOX_EPHYS_PYTHON_MODULE_DIR')])
def preload_download_recording_2(recording_object):
    import kachery_p2p as kp
    try:
        X = le.LabboxEphysRecordingExtractor(recording_object, download=True)
    except:
        return {'success': False}
    return {'success': True}

###################################################################################
# preload_extract_snippets
@hi.function('preload_extract_snippets', '0.1.0')
def preload_extract_snippets(labbox, recording_object, sorting_object):
    from labbox_ephys import prepare_snippets_h5
    jh = labbox.get_job_handler('partition2')
    jc = labbox.get_job_cache()
    with hi.Config(
        job_cache=jc,
        job_handler=jh,
        container=jh.is_remote
    ):
        snippets_h5 = prepare_snippets_h5.run(recording_object=recording_object, sorting_object=sorting_object)
        return snippets_h5