import { createCalculationPool, HitherContext } from 'labbox';
import React, { Fragment, FunctionComponent, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Recording, Sorting } from "../../pluginInterface";

interface ChildProps {
    preloadStatus?: 'waiting' | 'running' | 'finished'
}

type Props = {
    sorting: Sorting
    recording: Recording
    children: React.ReactElement<ChildProps>
    width: number
    height: number
}

const calculationPool = createCalculationPool({maxSimultaneous: 6})

const PreloadCheck: FunctionComponent<Props> = ({ recording, sorting, children, width, height }) => {
    const hither = useContext(HitherContext)
    const sortingObject = sorting.sortingObject
    const recordingObject = recording.recordingObject
    const [error, setError] = useState<Error | null>(null)
    const [status, setStatus] = useState<'waiting' | 'running' | 'finished'>('waiting')
    const [message, setMessage] = useState<string>('')
    const runningState = useRef<{sortingObject: any, recordingObject: any}>({sortingObject: sorting.sortingObject, recordingObject: recording.recordingObject})

    const matchesRunningState = useMemo(() => ((x: {recordingObject: any, sortingObject: any}) => (
        (runningState.current.sortingObject === x.sortingObject) && (runningState.current.recordingObject === x.recordingObject)
    )), [])

    useEffect(() => {
        if (status === 'waiting') {
            runningState.current = {recordingObject, sortingObject}
            setStatus('running')
            ;(async () => {
                try {
                    if (sorting.sortingObject) {
                        setMessage('Checking sorting data...')
                        const result1 = await hither.createHitherJob('preload_check_sorting_downloaded', {sorting_object: sortingObject}, {useClientCache: false, calculationPool}).wait() as {isLocal: boolean}
                        if (!matchesRunningState({recordingObject, sortingObject})) return
                        if (!result1.isLocal) {
                            setMessage('Downloading sorting...')
                            const result2 = await hither.createHitherJob('preload_download_sorting', {sorting_object: sortingObject}, {useClientCache: false, calculationPool}).wait() as {success: boolean}
                            if (!matchesRunningState({recordingObject, sortingObject})) return
                            if (!result2.success) {
                                setError(new Error('Unable to download sorting.'))
                                return
                            }
                        }
                    }

                    setMessage('Checking recording data...')
                    const result3 = await hither.createHitherJob('preload_check_recording_downloaded', {recording_object: recordingObject}, {useClientCache: false, calculationPool}).wait() as {isLocal: boolean}
                    if (!matchesRunningState({recordingObject, sortingObject})) return
                    if (!result3.isLocal) {
                        setMessage('Downloading recording...')
                        const result4 = await hither.createHitherJob('preload_download_recording', {recording_object: recordingObject}, {useClientCache: false, calculationPool}).wait() as {success: boolean}
                        if (!matchesRunningState({recordingObject, sortingObject})) return
                        if (!result4.success) {
                            setError(new Error('Unable to download recording.'))
                            return
                        }
                    }

                    if (sorting.sortingObject) {
                        setMessage('Extracting snippets...')
                        const result5 = await hither.createHitherJob('preload_extract_snippets', {recording_object: recordingObject, sorting_object: sortingObject}, {useClientCache: false, calculationPool}).wait() as string
                        if (!matchesRunningState({recordingObject, sortingObject})) return
                        if (!result5) {
                            setError(new Error('Problem extracting snippets'))
                            return
                        }
                    }
                    setStatus('finished')
                }
                catch(err) {
                    setError(err)
                }
            })()
        }
        else {
            if (!matchesRunningState({recordingObject, sortingObject})) {
                setStatus('waiting')
            }
        }
    }, [sortingObject, recordingObject, status, matchesRunningState, hither])

    const child = useMemo(() => {
        return React.cloneElement(
            children,
            {
                preloadStatus: status
            }
        )
    }, [children, status])

    // This is important for when the bandpass filter changes so that we don't start calculating things prior to doing the preloading (e.g. snippets extraction)
    const [lastValidChild, setLastValidChild] = useState<React.ReactElement | null>(null)
    useEffect(() => {
        if ((status === 'finished') && (matchesRunningState({recordingObject, sortingObject}))) setLastValidChild(child)
    }, [child, status, recordingObject, sortingObject, matchesRunningState])

    return (
        <Fragment>
            <BlockInteraction block={status !== 'finished'} {...{width, height}} message={error ? `Error: ${error.message}` : message} />
            {lastValidChild || child}
        </Fragment>
    )
}

const BlockInteraction: FunctionComponent<{width: number, height: number, block: boolean, message: string}> = ({width, height, block, message}) => {
    if (block) {
        return (
            <div className="BlockInteraction" style={{position: 'absolute', width, height, backgroundColor: 'gray', opacity: 0.5, zIndex: 99999}}>
                <div style={{backgroundColor: 'blue', color: 'white', fontSize: 20}}>{message}</div>
            </div>
        )
    }
    else {
        return <div className="BlockInteraction" />
    }
}

export default PreloadCheck