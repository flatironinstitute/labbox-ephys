import json
import spikeextractors as se
import spiketoolkit as st
import labbox_ephys as le
import hither as hi
import kachery_client as kc

# Create a temporary directory where SI will dump the data
with kc.TemporaryDirectory(remove=True) as tmpdir:
    # Create a dumpable SpikeInterface recording extractor
    R, S = se.example_datasets.toy_example(dumpable=True, dump_folder=tmpdir, seed=1)
    R2 = se.SubRecordingExtractor(parent_recording=R, start_frame=10)
    R3 = st.preprocessing.bandpass_filter(R2)

    # Convert to labbox-ephys recording extractor
    R_le = le.LabboxEphysRecordingExtractor.from_spikeinterface(R3)

    # Print the labbox-ephys object
    print(json.dumps(
        R_le.object(), indent=4
    ))

# expected output:
# {
#     "recording_format": "filtered",
#     "data": {
#         "filters": [
#             {
#                 "type": "bandpass_filter",
#                 "freq_min": 300,
#                 "freq_max": 6000,
#                 "freq_wid": 1000
#             }
#         ],
#         "recording": {
#             "recording_format": "subrecording",
#             "data": {
#                 "recording": {
#                     "recording_format": "mda",
#                     "data": {
#                         "raw": "sha1://a7f130d5587371956f6850f8b951211eb6e59727/raw.mda?manifest=df677aaf7dbc80c6d326b2b6e75c168b7f855e5c",
#                         "geom": [
#                             [
#                                 1.0,
#                                 0.0
#                             ],
#                             [
#                                 2.0,
#                                 0.0
#                             ],
#                             [
#                                 3.0,
#                                 0.0
#                             ],
#                             [
#                                 4.0,
#                                 0.0
#                             ]
#                         ],
#                         "params": {
#                             "samplerate": 30000.0
#                         }
#                     }
#                 },
#                 "channel_ids": null,
#                 "start_frame": 10,
#                 "end_frame": null
#             }
#         }
#     }
# }