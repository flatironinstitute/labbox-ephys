import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { ExternalSortingUnitMetric, WorkspaceInfo } from "../pluginInterface";
import { SortingCurationWorkspaceAction, WorkspaceDispatch, WorkspaceState } from '../pluginInterface/workspaceReducer';
import SortingView from './SortingView';
import WorkspaceRecordingsView from './WorkspaceRecordingsView';
import WorkspaceRecordingView from './WorkspaceRecordingView';

type Props = {
    workspaceInfo?: WorkspaceInfo
    defaultFeedId: string
    workspace: WorkspaceState
    workspaceDispatch: WorkspaceDispatch
    workspaceRoute: WorkspaceRoute
    workspaceRouteDispatch: WorkspaceRouteDispatch
    width: number
    height: number
}

type Page = 'recordings' | 'recording' | 'sorting'
export const isWorkspacePage = (x: string): x is Page => {
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
export type WorkspaceRoute = WorkspaceRecordingsRoute | WorspaceRecordingRoute | WorspaceSortingRoute
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
export type WorkspaceRouteAction = GotoRecordingsPageAction | GotoRecordingPageAction | GotoSortingPageAction
export type WorkspaceRouteDispatch = (a: WorkspaceRouteAction) => void

const routeFromLocation = (location: LocationInterface): WorkspaceRoute => {
    const pathList = location.pathname.split('/')
    const workspaceName = pathList[1] || 'default'
    const page = pathList[2] || 'recordings'
    if (!isWorkspacePage(page)) throw Error(`Invalid page: ${page}`)
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
  
  export interface LocationInterface {
    pathname: string
    search: string
  }
  
  export interface HistoryInterface {
    location: LocationInterface
    push: (x: LocationInterface) => void
  }
  
  export const useWorkspaceRoute = (location: LocationInterface, history: HistoryInterface, workspaceInfo: WorkspaceInfo | undefined): [WorkspaceRoute, WorkspaceRouteDispatch] => {
    const workspaceRouteDispatch = useMemo(() => ((a: WorkspaceRouteAction) => {
      const route = routeFromLocation(history.location)
      let newRoute: WorkspaceRoute | null = null
      switch (a.type) {
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
        history.push(locationFromRoute(newRoute, workspaceInfo || {workspaceName: '', feedUri: '', readOnly: true}))
      }
    }), [history, workspaceInfo])
  
    const workspaceRoute = useMemo(() => {
      return routeFromLocation(location)
    }, [location])
    return [workspaceRoute, workspaceRouteDispatch]
  }
  
  const locationFromRoute = (route: WorkspaceRoute, workspaceInfo: WorkspaceInfo) => {
    const queryParams: { [key: string]: string } = {}
    if (workspaceInfo.feedUri) {
      queryParams['feed'] = workspaceInfo.feedUri
    }
    switch (route.page) {
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

  var queryString = (params: { [key: string]: string }) => {
    const keys = Object.keys(params)
    if (keys.length === 0) return ''
    return '?' + (
      keys.map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
      }).join('&')
    )
  }

const WorkspaceView: FunctionComponent<Props> = ({ width, height, workspace, workspaceDispatch, workspaceInfo, defaultFeedId, workspaceRoute, workspaceRouteDispatch }) => {
    if (workspaceRoute.workspaceName !== workspaceInfo?.workspaceName) {
        throw Error(`Mismatch in workspace name: ${workspaceRoute.workspaceName} <> ${workspaceInfo?.workspaceName}`)
    }

    const handleDeleteRecordings = useCallback((recordingIds: string[]) => {
        workspaceDispatch({
            type: 'DELETE_RECORDINGS',
            recordingIds
        })
    }, [workspaceDispatch])

    const handleDeleteSortings = useCallback((sortingIds: string[]) => {
        workspaceDispatch({
            type: 'DELETE_SORTINGS',
            sortingIds
        })
    }, [workspaceDispatch])

    const curationDispatch = useCallback((a: SortingCurationWorkspaceAction) => {
        workspaceDispatch(a)
    }, [workspaceDispatch])

    switch (workspaceRoute.page) {
        case 'recordings': return (
            <WorkspaceRecordingsView
                onDeleteRecordings={handleDeleteRecordings}
                {...{ width, height, recordings: workspace.recordings, sortings: workspace.sortings, defaultFeedId, workspaceInfo, workspaceRouteDispatch }}
            />
        )
        case 'recording': {
            const rid = workspaceRoute.recordingId
            const recording = workspace.recordings.filter(r => (r.recordingId === rid))[0]
            if (!recording) return <div>Recording not found: {rid}</div>
            return (
                <WorkspaceRecordingView
                    onDeleteSortings={handleDeleteSortings}
                    {...{ width, height, recording, workspaceInfo, workspaceRouteDispatch, defaultFeedId }}
                    sortings={workspace.sortings.filter(s => (s.recordingId === rid))}
                />
            )
        }
        case 'sorting': {
            const rid = workspaceRoute.recordingId
            const recording = workspace.recordings.filter(r => (r.recordingId === rid))[0]
            if (!recording) return <div>Recording not found: {rid}</div>
            const sid = workspaceRoute.sortingId
            const sorting = workspace.sortings.filter(s => (s.recordingId === rid && s.sortingId === sid))[0]
            if (!sorting) return <div>Sorting not found: {rid}/{sid}</div>
            return (
                <SortingView
                    sorting={sorting}
                    recording={recording}
                    onSetExternalUnitMetrics={(a: { sortingId: string, externalUnitMetrics: ExternalSortingUnitMetric[] }) => { }}
                    curationDispatch={curationDispatch}
                    width={width}
                    height={height}
                    workspaceInfo={workspaceInfo}
                    workspaceRouteDispatch={workspaceRouteDispatch}
                />
            )
        }
    }
}

export default WorkspaceView