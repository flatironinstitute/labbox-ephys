from typing import cast
import labbox_ephys as le
import spikeextractors as se

recording, sorting = se.example_datasets.toy_example()

recording2 = le.LabboxEphysRecordingExtractor.create_efficient_recording(recording)
sorting2 = le.LabboxEphysSortingExtractor.store_sorting(sorting) 
print(recording2.object())
print(sorting2.object())

for R in [recording, recording2]:
    R = cast(se.RecordingExtractor, R)
    print(R.get_num_frames())
    print(R.get_num_channels())
    print(R.get_channel_ids())
    print(R.get_traces(start_frame=25, end_frame=40, channel_ids=[3]))

