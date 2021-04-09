import { createCalculationPool, HitherContext, usePlugins, useSubfeed } from 'labbox';
import React, { useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import Hyperlink from '../../common/Hyperlink';
import { useRecordingInfo } from '../../common/useRecordingInfo';
import { useSortingInfo } from '../../common/useSortingInfo';
import { LabboxPlugin, Recording, Sorting, SortingInfo, SortingSelection, sortingSelectionReducer, sortingViewPlugins, WorkspaceRoute, WorkspaceRouteDispatch } from '../../pluginInterface';
import { parseWorkspaceUri } from '../../pluginInterface/misc';
import { SortingCurationAction } from '../../pluginInterface/SortingCuration';
import { sortingCurationReducer } from '../../pluginInterface/workspaceReducer';

// const intrange = (a: number, b: number) => {
//   const lower = a < b ? a : b;
//   const upper = a < b ? b : a;
//   let arr = [];
//   for (let n = lower; n <= upper; n++) {
//       arr.push(n);
//   }
//   return arr;
// }

interface Props {
  sorting: Sorting | null
  recording: Recording
  width: number,
  height: number,
  workspaceRoute: WorkspaceRoute
  workspaceRouteDispatch: WorkspaceRouteDispatch
  readOnly: boolean
  // onSetExternalUnitMetrics: (a: { sortingId: string, externalUnitMetrics: ExternalSortingUnitMetric[] }) => void
}

type CalcStatus = 'waiting' | 'computing' | 'finished'

const calculationPool = createCalculationPool({maxSimultaneous: 6})

const SortingView: React.FunctionComponent<Props> = (props) => {
  const hither = useContext(HitherContext)
  const { workspaceRoute, readOnly, sorting, recording, workspaceRouteDispatch } = props
  // const [externalUnitMetricsStatus, setExternalUnitMetricsStatus] = useState<CalcStatus>('waiting');
  //const initialSortingSelection: SortingSelection = {currentTimepoint: 1000, animation: {currentTimepointVelocity: 100, lastUpdateTimestamp: Number(new Date())}}
  const initialSortingSelection: SortingSelection = {}
  const [selection, selectionDispatch] = useReducer(sortingSelectionReducer, initialSortingSelection)
  
  const sortingInfo = useSortingInfo(sorting ? sorting.sortingObject: null, sorting ? sorting.recordingObject : null)
  const recordingInfo = useRecordingInfo(recording.recordingObject)
  const sortingId = sorting ? sorting.sortingId : null

  const {feedUri, workspaceName} = parseWorkspaceUri(workspaceRoute.workspaceUri)

  const [curation, curationDispatch2] = useReducer(sortingCurationReducer, useMemo(() => ({}), []))
  const handleCurationSubfeedMessages = useCallback((messages: any[]) => {
    messages.forEach(msg => curationDispatch2(msg))
  }, [])
  const curationSubfeedName = useMemo(() => ({name: 'sortingCuration', workspaceName, sortingId}), [workspaceName, sortingId])
  const {appendMessages: appendCurationMessages} = useSubfeed({feedUri, subfeedName: curationSubfeedName, onMessages: handleCurationSubfeedMessages })
  const curationDispatch = useCallback((a: SortingCurationAction) => {
      appendCurationMessages([a])
  }, [appendCurationMessages])

  useEffect(() => {
    if ((!selection.timeRange) && (recordingInfo)) {
      selectionDispatch({type: 'SetTimeRange', timeRange: {min: 0, max: Math.min(recordingInfo.num_frames, recordingInfo.sampling_frequency / 10)}})
    }
  }, [selection, recordingInfo])

  // useEffect(() => {
  //   if ((sorting) && (sorting.externalUnitMetricsUri) && (!sorting.externalUnitMetrics) && (externalUnitMetricsStatus === 'waiting')) {
  //     setExternalUnitMetricsStatus('computing');
  //     hither.createHitherJob(
  //       'fetch_external_sorting_unit_metrics',
  //       { uri: sorting.externalUnitMetricsUri },
  //       { useClientCache: true }
  //     ).wait().then((externalUnitMetrics: any) => {
  //       onSetExternalUnitMetrics({ sortingId, externalUnitMetrics: externalUnitMetrics as ExternalSortingUnitMetric[] });
  //       setExternalUnitMetricsStatus('finished');
  //     })
  //   }
  // }, [onSetExternalUnitMetrics, setExternalUnitMetricsStatus, externalUnitMetricsStatus, sorting, sortingId, hither])

  const W = props.width || 800
  const H = props.height || 800

  const footerHeight = 20

  const footerStyle = useMemo<React.CSSProperties>(() => ({
    position: 'absolute',
    left: 0,
    top: H - footerHeight,
    width: W,
    height: footerHeight,
    overflow: 'hidden'
  }), [W, H, footerHeight])

  const contentWidth = W
  const contentHeight = H - footerHeight
  const contentWrapperStyle = useMemo<React.CSSProperties>(() => ({
    position: 'absolute',
    left: 0,
    top: 0,
    width: contentWidth,
    height: contentHeight
  }), [contentWidth, contentHeight])

  const plugins = usePlugins<LabboxPlugin>()
  const sv = sortingViewPlugins(plugins).filter(p => (p.name === 'MVSortingView'))[0]
  if (!sv) throw Error('Missing sorting view: MVSortingView')
  const svProps = useMemo(() => (sv.props || {}), [sv.props])

  const handleGotoRecording = useCallback(() => {
      workspaceRouteDispatch({
        type: 'gotoRecordingPage',
        recordingId: recording.recordingId
      })
  }, [workspaceRouteDispatch, recording.recordingId])

  const emptySorting: Sorting = useMemo(() => ({
    sortingId: '',
    sortingLabel: '',
    sortingPath: '',
    sortingObject: null,
    recordingId: '',
    recordingPath: '',
    recordingObject: null
  }), [])

  const emptySortingInfo: SortingInfo = useMemo(() => ({
    unit_ids: [],
    samplerate: 0
  }), [])

  if ((!recording) && (sorting)) {
    return <h3>{`Recording not found: ${sorting.recordingId}`}</h3>
  }
  if (!recordingInfo) {
    return <h3>Loading recording info...</h3>
  }
  if ((!sortingInfo) && (sorting)) {
    return <h3>Loading sorting info...</h3>
  }
  

  // const selectedUnitIdsLookup: {[key: string]: boolean} = (selection.selectedUnitIds || []).reduce((m, uid) => {m[uid + ''] = true; return m}, {} as {[key: string]: boolean})
  return (
    <div>
      <div style={contentWrapperStyle}>
          <sv.component
            {...svProps}
            sorting={sorting || emptySorting}
            recording={recording}
            sortingInfo={sortingInfo || emptySortingInfo}
            recordingInfo={recordingInfo}
            selection={selection}
            selectionDispatch={selectionDispatch}
            curation={curation}
            curationDispatch={curationDispatch}
            readOnly={readOnly}
            calculationPool={calculationPool}
            width={contentWidth}
            height={contentHeight}
          />
      </div>
      <div style={footerStyle}>
        { sorting ? (
          <span>
            {`Sorting: `}
            {sorting.sortingLabel}
            {` | Recording: `}
            {<Hyperlink onClick={handleGotoRecording}>{recording.recordingLabel}</Hyperlink>}
          </span>
        ) : (
          <span>
            {`Recording: `}
            {<Hyperlink onClick={handleGotoRecording}>{recording.recordingLabel}</Hyperlink>}
          </span>
        ) }
      </div>
    </div>
  );
}

export default SortingView