const { createHitherJob } = require("../hither");

export const getRecordingInfo = async ({recordingObject}) => {
    const recordingInfoJob = await createHitherJob(
        'get_recording_info',
        { recording_object: recordingObject },
        {
            kachery_config: {},
            job_handler_name: 'default',
            hither_config: {
                
            },
            auto_substitute_file_objects: false,
            useClientCache: true
        }
    )
    const info = await recordingInfoJob.wait();
    return info;
}