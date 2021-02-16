import React, { createContext, FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BasePlugin, WorkspaceInfo } from '.';
import { AppendOnlyLog, dummyAppendOnlyLog } from '../common/useFeedReducer';
import ApiConnection from './ApiConnection';
import { HitherContext } from './hither';
import initializeHitherInterface from './initializeHitherInterface';
import WorkspaceSubfeed from './WorkspaceSubfeed';
export type { CalculationPool } from './hither';

export const LabboxProviderContext = createContext<{
    plugins: BasePlugin[]
    websocketStatus: 'connected' | 'disconnected' | 'waiting',
    serverInfo: ServerInfo | null
    initialLoadComplete: boolean
    workspaceInfo: WorkspaceInfo
    workspaceSubfeed: AppendOnlyLog
    onReconnectWebsocket: () => void
}>({
    plugins: [],
    websocketStatus: 'waiting',
    serverInfo: null,
    initialLoadComplete: false,
    workspaceInfo: {workspaceName: null, feedUri: null, readOnly: null},
    workspaceSubfeed: dummyAppendOnlyLog,
    onReconnectWebsocket: () => { }
})

export class ExtensionContextImpl<Plugin extends BasePlugin> {
    plugins: Plugin[] = []
    registerPlugin(p: Plugin) {
        this.plugins.push(p)
    }
}

type HandlerType = 'local' | 'remote'

export interface ServerInfo {
    nodeId?: string
    defaultFeedId?: string
    labboxConfig?: {
        compute_resource_uri: string
        job_handlers: {
            local: {
                type: HandlerType
            },
            partition1: {
                type: HandlerType
            },
            partition2: {
                type: HandlerType
            },
            partition3: {
                type: HandlerType
            },
            timeseries: {
                type: HandlerType
            }
        }
    }
}

const useWebsocketStatus = (apiConnection: ApiConnection) => {
    const [websocketStatus, setWebsocketStatus] = useState<'connected' | 'disconnected' | 'waiting'>(apiConnection.isConnected() ? 'connected' : (apiConnection.isDisconnected() ? 'disconnected' : 'waiting'))
    useEffect(() => {
        apiConnection.onConnect(() => {
            setWebsocketStatus('connected')
        })
        apiConnection.onDisconnect(() => {
            setWebsocketStatus('disconnected')
        })
    }, [apiConnection])
    return websocketStatus
}

const useServerInfo = (apiConnection: ApiConnection) => {
    const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null)
    useEffect(() => {
        apiConnection.onMessage(msg => {
            const type0 = msg.type;
            if (type0 === 'reportServerInfo') {
                setServerInfo(msg.serverInfo)
            }
        });
    }, [apiConnection])
    return serverInfo
}

const useInitialLoadComplete = (apiConnection: ApiConnection) => {
    const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false)
    useEffect(() => {
        apiConnection.onMessage(msg => {
            const type0 = msg.type;
            if (type0 === 'reportInitialLoadComplete') {
                setInitialLoadComplete(true)
            }
        });
    }, [apiConnection])
    return initialLoadComplete
}

const useHitherInterface = (apiConnection: ApiConnection, baseSha1Url: string) => {
    const state = useRef<{ queuedHitherJobMessages: any[] }>({ queuedHitherJobMessages: [] })
    const hither = useMemo(() => {
        const y = initializeHitherInterface(baseSha1Url)
        y._registerSendMessage((msg) => {
            if (!apiConnection.isDisconnected()) {
                apiConnection.sendMessage(msg)
            }
            else {
                // being disconnected is not the same as not being connected
                // if connection has not yet been established, then the message will be queued in the apiConnection
                // but if disconnected, we will handle queuing here
                state.current.queuedHitherJobMessages.push(msg)
                if (msg.type === 'hitherCreateJob') {
                    state.current.queuedHitherJobMessages.push(msg)
                }
            }
        })
        apiConnection.onMessage(msg => {
            const type0 = msg.type;
            if (type0 === 'hitherJobFinished') {
                y.handleHitherJobFinished(msg);
            }
            else if (type0 === 'hitherJobError') {
                y.handleHitherJobError(msg);
            }
            else if (type0 === 'hitherJobCreated') {
                y.handleHitherJobCreated(msg);
            }
        });
        apiConnection.onConnect(() => {
            console.info('Connected to API server')
            state.current.queuedHitherJobMessages.forEach(msg => {
                apiConnection.sendMessage(msg)
            })
            state.current.queuedHitherJobMessages = []
        })
        return y
    }, [baseSha1Url, apiConnection])
    return hither
}

type Props = {
    children: React.ReactNode
    extensionContext: ExtensionContextImpl<any>
    workspaceInfo: WorkspaceInfo
}

const useWorkspaceSubfeed = (apiConnection: ApiConnection, workspaceInfo: WorkspaceInfo) => {
    return useMemo(() => {
        const x = new WorkspaceSubfeed(apiConnection)
        x.initialize(workspaceInfo)
        return x
    }, [apiConnection, workspaceInfo])
}

export const LabboxProvider: FunctionComponent<Props> = ({ children, extensionContext, workspaceInfo }) => {
    const baseSha1Url = `http://${window.location.hostname}:15309/sha1`;
    const apiConnection = useMemo(() => (new ApiConnection()), [])
    const websocketStatus = useWebsocketStatus(apiConnection)
    const serverInfo = useServerInfo(apiConnection)
    const initialLoadComplete = useInitialLoadComplete(apiConnection)
    const hither = useHitherInterface(apiConnection, baseSha1Url)
    const workspaceSubfeed = useWorkspaceSubfeed(apiConnection, workspaceInfo)
    const onReconnectWebsocket = useCallback(() => {
        apiConnection.reconnect()
        workspaceSubfeed.initialize(workspaceInfo)
    }, [apiConnection, workspaceSubfeed, workspaceInfo])
    const value = useMemo(() => ({
        plugins: extensionContext.plugins,
        websocketStatus,
        serverInfo,
        initialLoadComplete,
        workspaceSubfeed,
        workspaceInfo,
        onReconnectWebsocket
    }), [extensionContext.plugins, websocketStatus, serverInfo, initialLoadComplete, onReconnectWebsocket, workspaceSubfeed, workspaceInfo])
    return (
        <LabboxProviderContext.Provider value={value}>
            <HitherContext.Provider value={hither}>
                {children}
            </HitherContext.Provider>
        </LabboxProviderContext.Provider>
    )
}