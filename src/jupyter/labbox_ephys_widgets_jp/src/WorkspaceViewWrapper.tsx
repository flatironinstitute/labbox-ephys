import { WidgetModel } from '@jupyter-widgets/base';
import { usePlugins, useSubfeed } from 'labbox';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { filterPlugins, LabboxPlugin } from './extensions/pluginInterface';
import { parseWorkspaceUri } from './extensions/pluginInterface/misc';
import workspaceReducer, { WorkspaceAction } from './extensions/pluginInterface/workspaceReducer';
import { HistoryInterface, locationFromRoute, LocationInterface, routeFromLocation, WorkspaceRoute, WorkspaceRouteAction, WorkspaceRouteDispatch, workspaceRouteReducer } from './extensions/pluginInterface/WorkspaceRoute';
import WorkspaceView from './extensions/workspaceview/WorkspaceView';

interface Props {
    model: WidgetModel
    workspaceUri: string
}

export const useWorkspaceRoute = (location: LocationInterface, history: HistoryInterface, workspaceUri: string | undefined): [WorkspaceRoute, WorkspaceRouteDispatch] => {
    const workspaceRouteDispatch = useMemo(() => ((a: WorkspaceRouteAction) => {
        const route = routeFromLocation(history.location, {})
        let newRoute: WorkspaceRoute = workspaceRouteReducer(route, a)
        const newLocation = locationFromRoute(newRoute)
        if ((newLocation.pathname !== location.pathname) || (newLocation.search !== location.search)) {
            history.push(newLocation)
        }
    }), [location, history])

    const workspaceRoute = useMemo(() => {
        return routeFromLocation(location, {})
    }, [location])
    return [workspaceRoute, workspaceRouteDispatch]
}

const WorkspaceViewWrapper: FunctionComponent<Props> = ({ model, workspaceUri }) => {
    // const { serverInfo } = useContext(LabboxProviderContext)
    const plugins = usePlugins<LabboxPlugin>()

    const handleWorkspaceSubfeedMessages = useCallback((messages: any[]) => {
        messages.forEach(msg => {
            if (msg.action) {
                workspaceDispatch2(msg.action)
            }
        })
    }, [])
    const { feedUri, workspaceName } = parseWorkspaceUri(workspaceUri)
    const subfeedName = useMemo(() => ({ workspaceName: workspaceName || '' }), [workspaceName])
    const { appendMessages: appendWorkspaceMessages, loadedInitialMessages: initialLoadComplete } = useSubfeed({ feedUri, subfeedName, onMessages: handleWorkspaceSubfeedMessages })
    const [workspace, workspaceDispatch2] = useReducer(workspaceReducer, { recordings: [], sortings: [] })
    // const workspaceSubfeed = useAppendOnlyLog({feedUri: '', subfeedName})
    const workspaceDispatch = useCallback((a: WorkspaceAction) => {
        appendWorkspaceMessages([{ action: a }])
    }, [appendWorkspaceMessages])

    // // We need to wrap the workspaceSubfeed in workspaceSubfeedForReducer because the messages in the subfeed are of the form {action: x}, whereas the reducer just takes the actions (ie x)
    // const workspaceSubfeedForReducer = useMemo((): AppendOnlyLog => {
    //     return {
    //         appendMessage: (msg: any) => {
    //             workspaceSubfeed.appendMessage({ action: msg })
    //         },
    //         allMessages: () => (workspaceSubfeed.allMessages().map(m => (m.action || {}))),
    //         onMessage: (callback: (msg: any) => void) => {
    //             workspaceSubfeed.onMessage((m: any) => {
    //                 callback(m.action || {})
    //             })
    //         }
    //     }
    // }, [workspaceSubfeed])

    // const [workspace, workspaceDispatch] = useFeedReducer<WorkspaceState, WorkspaceAction>(
    //     workspaceReducer,
    //     { recordings: [], sortings: [] },
    //     workspaceSubfeedForReducer
    // )

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

    const [location, setLocation] = useState<LocationInterface>({ pathname: '', search: '?' })
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

    const [workspaceRoute, workspaceRouteDispatch] = useWorkspaceRoute(location, history, workspaceUri)

    return (
        <div ref={divRef} className="WorkspaceViewWrapper" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
            <WorkspaceView
                {...{
                    defaultFeedId: '',
                    workspace,
                    workspaceDispatch,
                    plugins: filterPlugins(plugins),
                    workspaceRoute,
                    workspaceRouteDispatch,
                    width: width || 700,
                    height: height || 700
                }}
            />
        </div>
    )
}

// class WorkspaceSubfeed {
//     _messages: any[] = []
//     _onMessageCallbacks: ((msg: any) => void)[] = []
//     constructor(private model: WidgetModel, private feedUri: string, private workspaceName: string) {
//         const watchName = 'workspace-' + randomAlphaId()
//         model.send({ type: 'addSubfeedWatch', watchName, feedUri: feedUri, subfeedName: { workspaceName } }, {})
//         model.on('msg:custom', (msgs: any) => {
//             for (let msg of msgs) {
//                 if (msg.type === 'subfeedMessage') {
//                     if (msg.watchName === watchName) {
//                         this._messages.push(msg.message)
//                         this._onMessageCallbacks.forEach(cb => cb(msg.message))
//                     }
//                 }
//             }
//         })
//     }
//     appendMessage(message: any) {
//         this.model.send({ type: 'appendSubfeedMessage', feedUri: this.feedUri, subfeedName: { workspaceName: this.workspaceName }, message }, {})
//     }
//     allMessages() {
//         return [...this._messages]
//     }
//     onMessage(cb: (msg: any) => void) {
//         this._onMessageCallbacks.push(cb)
//     }
// }

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

// function randomAlphaId() {
//     const num_chars = 10;
//     const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
//     let text = "";
//     for (let i = 0; i < num_chars; i++)
//         text += possible.charAt(Math.floor(Math.random() * possible.length));
//     return text;
// }

export default WorkspaceViewWrapper