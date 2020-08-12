const { createHitherJob } = require("../hither");

export const getRecordingInfo = async ({recordingObject}) => {
    const recordingInfoJob = await createHitherJob(
        'get_recording_info',
        { recording_object: recordingObject },
        {
            kachery_config: {},
            hither_config: {
                job_handler_role: 'general'
            },
            auto_substitute_file_objects: false,
            useClientCache: true
        }
    )
    const info = await recordingInfoJob.wait();
    return info;
}