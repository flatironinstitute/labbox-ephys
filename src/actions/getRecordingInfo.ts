import { HitherContext } from "../extensions/extensionInterface";
import { RecordingInfo } from "../reducers/recordings";

export const getRecordingInfo = async (a: {recordingObject: any, hither: HitherContext}): Promise<RecordingInfo> => {
    const recordingInfoJob = a.hither.createHitherJob(
        'createjob_get_recording_info',
        { recording_object: a.recordingObject },
        {
            useClientCache: true,
            newHitherJobMethod: true
        }
    )
    const info = await recordingInfoJob.wait();
    return info as RecordingInfo;
}