const { createHitherJob } = require("../hither");

export const getRecordingInfo = async ({recordingObject}) => {
    const recordingInfoJob = await createHitherJob(
        'createjob_get_recording_info',
        { recording_object: recordingObject },
        {
            kachery_config: {},
            hither_config: {
                
            },
            useClientCache: true,
            newHitherJobMethod: true
        }
    )
    const info = await recordingInfoJob.wait();
    return info;
}