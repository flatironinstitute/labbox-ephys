import { Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core';
import { createCalculationPool, HitherContext, usePlugins, WorkspaceInfo } from 'labbox';
import React, { useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import Hyperlink from '../common/Hyperlink';
import { useRecordingInfo } from '../common/useRecordingInfo';
import { useSortingInfo } from '../common/useSortingInfo';
import { ExternalSortingUnitMetric, LabboxPlugin, Recording, Sorting, SortingSelection, sortingSelectionReducer, sortingViewPlugins } from '../pluginInterface';
import { SortingCurationWorkspaceAction } from '../pluginInterface/workspaceReducer';
import { WorkspaceRouteDispatch } from './WorkspaceView';

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
  sorting: Sorting
  recording: Recording
  width: number,
  height: number,
  workspaceRouteDispatch: WorkspaceRouteDispatch
  workspaceInfo: WorkspaceInfo
  onSetExternalUnitMetrics: (a: { sortingId: string, externalUnitMetrics: ExternalSortingUnitMetric[] }) => void
  curationDispatch: (a: SortingCurationWorkspaceAction) => void
}

type CalcStatus = 'waiting' | 'computing' | 'finished'

const calculationPool = createCalculationPool({maxSimultaneous: 6})

const SortingView: React.FunctionComponent<Props> = (props) => {
  const hither = useContext(HitherContext)
  const { workspaceInfo, sorting, recording, curationDispatch, onSetExternalUnitMetrics, workspaceRouteDispatch } = props
  const { readOnly } = workspaceInfo;
  const [externalUnitMetricsStatus, setExternalUnitMetricsStatus] = useState<CalcStatus>('waiting');
  //const initialSortingSelection: SortingSelection = {currentTimepoint: 1000, animation: {currentTimepointVelocity: 100, lastUpdateTimestamp: Number(new Date())}}
  const initialSortingSelection: SortingSelection = {}
  const [selection, selectionDispatch] = useReducer(sortingSelectionReducer, initialSortingSelection)
  
  const sortingInfo = useSortingInfo(sorting.sortingObject, sorting.recordingObject)
  const recordingInfo = useRecordingInfo(recording.recordingObject)
  const sortingId = sorting.sortingId

  useEffect(() => {
    if ((!selection.timeRange) && (recordingInfo)) {
      selectionDispatch({type: 'SetTimeRange', timeRange: {min: 0, max: Math.min(recordingInfo.num_frames, recordingInfo.sampling_frequency / 10)}})
    }
  }, [selection, recordingInfo])

  useEffect(() => {
    if ((sorting) && (sorting.externalUnitMetricsUri) && (!sorting.externalUnitMetrics) && (externalUnitMetricsStatus === 'waiting')) {
      setExternalUnitMetricsStatus('computing');
      hither.createHitherJob(
        'fetch_external_sorting_unit_metrics',
        { uri: sorting.externalUnitMetricsUri },
        { useClientCache: true }
      ).wait().then((externalUnitMetrics: any) => {
        onSetExternalUnitMetrics({ sortingId, externalUnitMetrics: externalUnitMetrics as ExternalSortingUnitMetric[] });
        setExternalUnitMetricsStatus('finished');
      })
    }
  }, [onSetExternalUnitMetrics, setExternalUnitMetricsStatus, externalUnitMetricsStatus, sorting, sortingId, hither])

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

  if (!sorting) {
    return <h3>{`Sorting not found: ${sortingId}`}</h3>
  }
  if (!recording) {
    return <h3>{`Recording not found: ${sorting.recordingId}`}</h3>
  }
  if (!recordingInfo) {
    return <h3>Loading recording info...</h3>
  }
  if (!sortingInfo) {
    return <h3>Loading sorting info...</h3>
  }
  

  // const selectedUnitIdsLookup: {[key: string]: boolean} = (selection.selectedUnitIds || []).reduce((m, uid) => {m[uid + ''] = true; return m}, {} as {[key: string]: boolean})
  return (
    <div>
      <div style={contentWrapperStyle}>
          <sv.component
            {...svProps}
            sorting={sorting}
            recording={recording}
            sortingInfo={sortingInfo}
            recordingInfo={recordingInfo}
            selection={selection}
            selectionDispatch={selectionDispatch}
            curationDispatch={curationDispatch}
            readOnly={readOnly}
            calculationPool={calculationPool}
            width={contentWidth}
            height={contentHeight}
          />
      </div>
      <div style={footerStyle}>
          {`Sorting: `}
          {sorting.sortingLabel}
          {` | Recording: `}
          {<Hyperlink onClick={handleGotoRecording}>{recording.recordingLabel}</Hyperlink>}
      </div>
    </div>
  );
}

export const Expandable = (props: { label: string, children: React.ReactNode[] | React.ReactNode, defaultExpanded?: boolean }) => {
  return (
    <Accordion TransitionProps={{ unmountOnExit: true }} defaultExpanded={props.defaultExpanded}>
      <AccordionSummary>
        {props.label}
      </AccordionSummary>
      <AccordionDetails>
        <div style={{width: "100%"}}>
          {props.children}
        </div>
      </AccordionDetails>
    </Accordion>
  )
}

export default SortingView