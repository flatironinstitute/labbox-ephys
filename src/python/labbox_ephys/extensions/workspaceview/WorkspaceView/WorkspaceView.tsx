import React, { FunctionComponent, useCallback } from 'react';
import { ExternalSortingUnitMetric } from "../../pluginInterface";
import { SortingCurationWorkspaceAction } from '../../pluginInterface/workspaceReducer';
import { WorkspaceViewProps } from '../../pluginInterface/WorkspaceViewPlugin';
import SortingView from './SortingView';
import WorkspaceRecordingsView from './WorkspaceRecordingsView';
import WorkspaceRecordingView from './WorkspaceRecordingView';

export interface LocationInterface {
  pathname: string
  search: string
}

export interface HistoryInterface {
  location: LocationInterface
  push: (x: LocationInterface) => void
}

// export const useWorkspaceRoute = (location: LocationInterface, history: HistoryInterface, workspaceInfo: WorkspaceInfo | undefined): [WorkspaceRoute, WorkspaceRouteDispatch] => {
//   const workspaceRouteDispatch = useMemo(() => ((a: WorkspaceRouteAction) => {
//     const route = routeFromLocation(history.location)
//     let newRoute: WorkspaceRoute | null = null
//     switch (a.type) {
//       case 'gotoRecordingsPage': newRoute = {
//         page: 'recordings',
//         workspaceName: route.workspaceName
//       }; break;
//       case 'gotoRecordingPage': newRoute = {
//         page: 'recording',
//         recordingId: a.recordingId,
//         workspaceName: route.workspaceName
//       }; break;
//       case 'gotoSortingPage': newRoute = {
//         page: 'sorting',
//         recordingId: a.recordingId,
//         sortingId: a.sortingId,
//         workspaceName: route.workspaceName
//       }; break
//     }
//     if (newRoute) {
//       history.push(locationFromRoute(newRoute, workspaceInfo || { workspaceName: '', feedUri: '', readOnly: true }))
//     }
//   }), [history, workspaceInfo])

//   const workspaceRoute = useMemo(() => {
//     return routeFromLocation(location)
//   }, [location])
//   return [workspaceRoute, workspaceRouteDispatch]
// }

const WorkspaceView: FunctionComponent<WorkspaceViewProps> = ({ workspace, workspaceDispatch, workspaceRoute, workspaceRouteDispatch, width=500, height=500 }) => {
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
        {...{ width, height, recordings: workspace.recordings, sortings: workspace.sortings, workspaceRoute, workspaceRouteDispatch }}
      />
    )
    case 'recording': {
      const rid = workspaceRoute.recordingId
      const recording = workspace.recordings.filter(r => (r.recordingId === rid))[0]
      if (!recording) return <div>Recording not found: {rid}</div>
      return (
        <WorkspaceRecordingView
          onDeleteSortings={handleDeleteSortings}
          {...{ width, height, recording, workspaceRouteDispatch, workspaceRoute }}
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
          readOnly={false}
          workspaceRouteDispatch={workspaceRouteDispatch}
        />
      )
    }
  }
}

export default WorkspaceView