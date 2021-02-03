import React, { FunctionComponent, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router';
import { WorkspaceInfo } from '../AppContainer';
import { Plugins } from '../extensions/extensionInterface';
import { Recording } from '../reducers/recordings';
import { ServerInfo } from '../reducers/serverInfo';
import { Sorting } from '../reducers/sortings';
import SortingView from './SortingView';
import WorkspaceRecordingsView from './WorkspaceRecordingsView';
import WorkspaceRecordingView from './WorkspaceRecordingView';

type Props = {
    workspaceInfo: WorkspaceInfo
    serverInfo: ServerInfo
    sortings: Sorting[]
    recordings: Recording[]
    plugins: Plugins
    onDeleteRecordings: (recordingIds: string[]) => void
    width: number
    height: number
}

type Page = 'recordings' | 'recording' | 'sorting'
const isPage = (x: string): x is Page => {
    return ['recordings', 'recording', 'sorting'].includes(x)
}

type WorkspaceRecordingsRoute = {
    page: 'recordings',
    workspaceName: string
}
type WorspaceRecordingRoute = {
    page: 'recording',
    recordingId: string,
    workspaceName: string
}
type WorspaceSortingRoute = {
    page: 'sorting',
    recordingId: string,
    sortingId: string,
    workspaceName: string
}
type WorkspaceRoute = WorkspaceRecordingsRoute | WorspaceRecordingRoute | WorspaceSortingRoute
type GotoRecordingsPageAction = {
    type: 'gotoRecordingsPage'
}
type GotoRecordingPageAction = {
    type: 'gotoRecordingPage',
    recordingId: string
}
type GotoSortingPageAction = {
    type: 'gotoSortingPage',
    recordingId: string,
    sortingId: string
}
type WorkspaceRouteAction = GotoRecordingsPageAction | GotoRecordingPageAction | GotoSortingPageAction
export type WorkspaceRouteDispatch = (a: WorkspaceRouteAction) => void

const routeFromLocation = (location: {pathname: string, search: string}): WorkspaceRoute => {
    const pathList = location.pathname.split('/')
    const workspaceName = pathList[1] || 'default'
    const page = pathList[2] || 'recordings'
    if (!isPage(page)) throw Error(`Invalid page: ${page}`)
    switch (page) {
        case 'recordings': return {
            workspaceName,
            page
        }
        case 'recording': return {
            workspaceName,
            page,
            recordingId: pathList[3]
        }
        case 'sorting': return {
            workspaceName,
            page,
            recordingId: pathList[3] || '',
            sortingId: pathList[4] || ''
        }
        default: return {
            workspaceName,
            page: 'recordings'
        }
    }
}

var queryString = (params: {[key: string]: string}) => {
    const keys = Object.keys(params)
    if (keys.length === 0) return ''
    return '?' + (
        keys.map((key) => {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
        }).join('&')
    )
}

const locationFromRoute = (route: WorkspaceRoute, workspaceInfo: WorkspaceInfo) => {
    const queryParams: {[key: string]: string} = {}
    if (workspaceInfo.feedUri) {
        queryParams['feed'] = workspaceInfo.feedUri
    }
    switch(route.page) {
        case 'recordings': return {
            pathname: `/${route.workspaceName}`,
            search: queryString(queryParams)
        }
        case 'recording': return {
            pathname: `/${route.workspaceName}/recording/${route.recordingId}`,
            search: queryString(queryParams)
        }
        case 'sorting': return {
            pathname: `/${route.workspaceName}/sorting/${route.recordingId}/${route.sortingId}`,
            search: queryString(queryParams)
        }
    }
}

const WorkspaceView: FunctionComponent<Props> = ({ width, height, sortings, recordings, onDeleteRecordings, workspaceInfo, serverInfo, plugins }) => {
    const history = useHistory()
    const location = useLocation()
    const route = routeFromLocation(location)
    if (route.workspaceName !== workspaceInfo.workspaceName) {
        throw Error(`Mismatch in workspace name: ${route.workspaceName} <> ${workspaceInfo.workspaceName}`)
    }
    const workspaceRouteDispatch = useMemo(() => ((a: WorkspaceRouteAction) => {
        const route = routeFromLocation(history.location)
        let newRoute: WorkspaceRoute | null = null
        switch(a.type) {
            case 'gotoRecordingsPage': newRoute = {
                page: 'recordings',
                workspaceName: route.workspaceName
            }; break;
            case 'gotoRecordingPage': newRoute = {
                page: 'recording',
                recordingId: a.recordingId,
                workspaceName: route.workspaceName
            }; break;
            case 'gotoSortingPage': newRoute = {
                page: 'sorting',
                recordingId: a.recordingId,
                sortingId: a.sortingId,
                workspaceName: route.workspaceName
            }; break
        }
        if (newRoute) {
            history.push(locationFromRoute(newRoute, workspaceInfo))
        }
    }), [history, workspaceInfo])

    switch(route.page) {
        case 'recordings': return (
            <WorkspaceRecordingsView
                {...{width, height, sortings, recordings, onDeleteRecordings, workspaceInfo, serverInfo, workspaceRouteDispatch}}
            />
        )
        case 'recording': {
            const rid = route.recordingId
            const recording = recordings.filter(r => (r.recordingId === rid))[0]
            if (!recording) return <div>Recording not found: {rid}</div>
            return (    
                <WorkspaceRecordingView
                    {...{width, height, recording, workspaceInfo, plugins, workspaceRouteDispatch}}
                    sortings={sortings.filter(s => (s.recordingId === rid))}
                />
            )
        }
        case 'sorting': {
            const rid = route.recordingId
            const recording = recordings.filter(r => (r.recordingId === rid))[0]
            if (!recording) return <div>Recording not found: {rid}</div>
            const sid = route.sortingId
            const sorting = sortings.filter(s => (s.recordingId === rid && s.sortingId === sid))
            if (!sorting) return <div>Sorting not found: {rid}/{sid}</div>
            return (
                <SortingView
                    sortingId={sid}
                    width={width}
                    height={height}
                    workspaceInfo={workspaceInfo}
                />
            )
        }
    }
}

export default WorkspaceView