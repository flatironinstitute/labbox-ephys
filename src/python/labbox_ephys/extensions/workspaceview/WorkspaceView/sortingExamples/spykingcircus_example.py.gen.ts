const text: string = "# Prerequisites:\n#    SpikeInterface/spikesorters: `pip install spikesorters`\n#    SpyKING CIRCUS: `pip install spyking-circus`\n#    On Ubuntu, the following are required for spyking circus:\n#        pip install pyqt5\n#        apt install qt5-default\n#    For more information: https://spyking-circus.readthedocs.io/en/latest/introduction/install.html\n\nimport spikeextractors as se\nimport numpy as np\nimport labbox_ephys as le\nfrom labbox_ephys import sorters\nimport kachery_p2p as kp\n\nif __name__ == '__main__':\n    # adjust these values\n    workspace_uri = '{workspaceUri}'\n    recording_id = '{recordingId}' # {recordingLabel}\n\n    workspace = le.load_workspace(workspace_uri)\n    le_recording = workspace.get_recording(recording_id)\n    recording_object = le_recording['recordingObject']\n\n    sorting_object = sorters.spykingcircus(\n        recording_object=recording_object,\n        detect_sign=-1,\n        adjacency_radius=100,\n        detect_threshold=6,\n        template_width_ms=3,\n        filter=True,\n        merge_spikes=True,\n        auto_merge=0.75,\n        num_workers=None,\n        whitening_max_elts=1000,\n        clustering_max_elts=10000\n    )\n    sorting = le.LabboxEphysSortingExtractor(sorting_object)\n\n    S_id = workspace.add_sorting(\n        sorting=sorting,\n        recording_id=recording_id,\n        label='spykingcircus'\n    )"

export default text