import { useContext, useRef, useState } from "react";
import { Recording, RecordingInfo } from "../../reducers/recordings";
import { Sorting, SortingInfo } from "../../reducers/sortings";
import { HitherContext, HitherInterface, HitherJob, useHitherJob } from "./hither";

export const getRecordingInfo = async (a: {recordingObject: any, hither: HitherInterface}): Promise<RecordingInfo> => {
    const recordingInfoJob = a.hither.createHitherJob(
        'createjob_get_recording_info',
        { recording_object: a.recordingObject },
        {
            useClientCache: true
        }
    )
    const info = await recordingInfoJob.wait();
    return info as RecordingInfo;
}

export const useRecordingInfo = (recordingObject: any): RecordingInfo | undefined => {
    const {result: recordingInfo} = useHitherJob<RecordingInfo>(
        recordingObject ? 'createjob_get_recording_info': '',
        {recording_object: recordingObject},
        {useClientCache: true}
    )
    return recordingInfo
}

export const useRecordingInfos = (recordings: Recording[]): {[key: string]: RecordingInfo} => {
    const hither = useContext(HitherContext)
    const jobs = useRef<{[key: string]: HitherJob}>({})
    const [, setCount] = useState(0) // just for triggering update
    const ret: {[key: string]: RecordingInfo} = {}
    recordings.forEach(r => {
        const rid = r.recordingId
        if (!jobs.current[rid]) {
            const j = hither.createHitherJob('createjob_get_recording_info', {recording_object: r.recordingObject}, {useClientCache: true})
            jobs.current[rid] = j
            j.wait().then(() => {
                setCount(c => (c + 1))
            })
            .catch(() => {
                setCount(c => (c + 1))
            })
        }
        if (jobs.current[rid].result) {
            ret[rid] = jobs.current[rid].result as RecordingInfo
        }
    })
    return ret
}

export const useSortingInfo = (sortingObject: any, recordingObject: any): SortingInfo | undefined => {
    const {result: sortingInfo} = useHitherJob<SortingInfo>(
        sortingObject ? 'createjob_get_sorting_info': '',
        {sorting_object: sortingObject, recording_object: recordingObject},
        {useClientCache: true}
    )
    return sortingInfo
}

export const useSortingInfos = (sortings: Sorting[]): {[key: string]: SortingInfo} => {
    const hither = useContext(HitherContext)
    const jobs = useRef<{[key: string]: HitherJob}>({})
    const [, setCount] = useState(0) // just for triggering update
    const ret: {[key: string]: SortingInfo} = {}
    sortings.forEach(s => {
        const rid = s.sortingId
        if (!jobs.current[rid]) {
            const j = hither.createHitherJob('createjob_get_sorting_info', {recording_object: s.recordingObject, sorting_object: s.sortingObject}, {useClientCache: true})
            jobs.current[rid] = j
            j.wait().then(() => {
                setCount(c => (c + 1))
            })
            .catch(() => {
                setCount(c => (c + 1))
            })
        }
        if (jobs.current[rid].result) {
            ret[rid] = jobs.current[rid].result as SortingInfo
        }
    })
    return ret
}