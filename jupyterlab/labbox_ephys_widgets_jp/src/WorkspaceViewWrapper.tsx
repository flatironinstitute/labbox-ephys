import { WidgetModel } from '@jupyter-widgets/base';
import React, { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { AppendOnlyLog, useFeedReducer } from './extensions/common/useFeedReducer';
import workspaceReducer, { WorkspaceAction, WorkspaceState } from './extensions/common/workspaceReducer';
import { Plugins } from './extensions/extensionInterface';
import WorkspaceView, { WorkspaceInfo } from './extensions/WorkspaceView';
import { HistoryInterface, LocationInterface } from './extensions/WorkspaceView/WorkspaceView';

interface Props {
    feedUri: string
    workspaceName: string
    plugins: Plugins
    model: WidgetModel
    curationUri?: string
}

const WorkspaceViewWrapper: FunctionComponent<Props> = ({ feedUri, workspaceName, plugins, model }) => {
    // curation
    // const [curation, curationDispatch] = useReducer(sortingCurationReducer, model.get('curation'))
    const workspaceSubfeed: AppendOnlyLog | null = useMemo(() => (
        new WorkspaceSubfeed(model, feedUri, workspaceName)
    ), [model, feedUri, workspaceName])

    // We need to wrap the workspaceSubfeed in workspaceSubfeedForReducer because the messages in the subfeed are of the form {action: x}, whereas the reducer just takes the actions (ie x)
    const workspaceSubfeedForReducer = useMemo((): AppendOnlyLog => {
        return {
            appendMessage: (msg: any) => {
                workspaceSubfeed.appendMessage({ action: msg })
            },
            allMessages: () => (workspaceSubfeed.allMessages().map(m => (m.action || {}))),
            onMessage: (callback: (msg: any) => void) => {
                workspaceSubfeed.onMessage((m: any) => {
                    callback(m.action || {})
                })
            }
        }
    }, [workspaceSubfeed])

    const [workspace, workspaceDispatch] = useFeedReducer<WorkspaceState, WorkspaceAction>(
        workspaceReducer,
        { recordings: [], sortings: [] },
        workspaceSubfeedForReducer
    )

    // externalUnitMetrics

    const [divElement, setDivElement] = useState<HTMLDivElement | null>(null)
    const [width, setWidth] = useState<number | undefined>(undefined)
    const [height, setHeight] = useState<number | undefined>(undefined)
    const [pollIndex, setPollIndex] = useState(0)
    const divRef = React.useCallback((elmt: HTMLDivElement) => {
        // this should get called only once after the div has been written to the DOM
        // we set this div element so that it can be used below when we set the canvas
        // elements to the layers
        setDivElement(elmt)
    }, [])

    useEffect(() => {
        if (divElement) {
            if (width !== divElement.offsetWidth) {
                setWidth(divElement.offsetWidth)
            }
            if (height !== divElement.offsetHeight) {
                setHeight(divElement.offsetHeight)
            }
        }
    }, [divElement, width, height, setWidth, setHeight, pollIndex])

    useInterval(() => {
        setPollIndex(pollIndex + 1)
    }, 1000)

    const workspaceInfo: WorkspaceInfo = {
        workspaceName,
        feedUri,
        readOnly: false
    }

    const [location, setLocation] = useState<LocationInterface>({pathname: '', search: '?'})
    const [locationHistory, setLocationHistory] = useState<LocationInterface[]>([])

    const history: HistoryInterface = useMemo(() => {
        const push = (x: LocationInterface) => {
            setLocationHistory([...locationHistory, location])
            setLocation(x)
        }
        return {
            location,
            push
        }
    }, [location, locationHistory])

    return (
        <div ref={divRef} className="WorkspaceViewWrapper" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
            <WorkspaceView
                {...{
                    workspaceInfo,
                    defaultFeedId: '',
                    workspace,
                    workspaceDispatch,
                    plugins,
                    history,
                    location,
                    width: width || 700,
                    height: height || 700
                }}
            />
        </div>
    )
}



class WorkspaceSubfeed {
    _messages: any[] = []
    _onMessageCallbacks: ((msg: any) => void)[] = []
    constructor(private model: WidgetModel, private feedUri: string, private workspaceName: string) {
        const watchName = 'workspace-' + randomAlphaId()
        model.send({ type: 'addSubfeedWatch', watchName, feedUri: feedUri, subfeedName: { workspaceName } }, {})
        model.on('msg:custom', (msgs: any) => {
            for (let msg of msgs) {
                if (msg.type === 'subfeedMessage') {
                    if (msg.watchName === watchName) {
                        this._messages.push(msg.message)
                        this._onMessageCallbacks.forEach(cb => cb(msg.message))
                    }
                }
            }
        })
    }
    appendMessage(message: any) {
        this.model.send({ type: 'appendSubfeedMessage', feedUri: this.feedUri, subfeedName: { workspaceName: this.workspaceName }, message }, {})
    }
    allMessages() {
        return [...this._messages]
    }
    onMessage(cb: (msg: any) => void) {
        this._onMessageCallbacks.push(cb)
    }
}

// thanks: https://usehooks-typescript.com/react-hook/use-interval
function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef<() => void | null>()
    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback
    })
    // Set up the interval.
    useEffect(() => {
        function tick() {
            if (typeof savedCallback?.current !== 'undefined') {
                savedCallback?.current()
            }
        }
        if (delay !== null) {
            const id = setInterval(tick, delay)
            return () => clearInterval(id)
        }
    }, [delay])
}

function randomAlphaId() {
    const num_chars = 10;
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let text = "";
    for (let i = 0; i < num_chars; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

export default WorkspaceViewWrapper