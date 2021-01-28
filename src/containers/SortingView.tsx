import { Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core';
import React, { Dispatch, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { setExternalSortingUnitMetrics } from '../actions';
import { WorkspaceInfo } from '../AppContainer';
import { useRecordingInfo, useSortingInfo } from '../extensions/common/getRecordingInfo';
import { createCalculationPool, HitherContext } from '../extensions/common/hither';
import { filterPlugins, Plugins, SortingCurationAction, SortingSelection, sortingSelectionReducer } from '../extensions/extensionInterface';
import { getPathQuery } from '../kachery';
import { RootAction, RootState } from '../reducers';
import { Recording } from '../reducers/recordings';
import { ExternalSortingUnitMetric, Sorting } from '../reducers/sortings';

// const intrange = (a: number, b: number) => {
//   const lower = a < b ? a : b;
//   const upper = a < b ? b : a;
//   let arr = [];
//   for (let n = lower; n <= upper; n++) {
//       arr.push(n);
//   }
//   return arr;
// }

interface StateProps {
  sorting?: Sorting
  recording?: Recording
  extensionsConfig: any
  plugins: Plugins
}

interface DispatchProps {
  onSetExternalUnitMetrics: (a: { sortingId: string, externalUnitMetrics: ExternalSortingUnitMetric[] }) => void
  curationDispatch: (a: SortingCurationAction) => void
}

interface OwnProps {
  sortingId: string,
  width: number,
  height: number,
  workspaceInfo: WorkspaceInfo
}

type Props = StateProps & DispatchProps & OwnProps & RouteComponentProps

type CalcStatus = 'waiting' | 'computing' | 'finished'

const calculationPool = createCalculationPool({maxSimultaneous: 6})

const SortingView: React.FunctionComponent<Props> = (props) => {
  const hither = useContext(HitherContext)
  const { plugins, workspaceInfo, sorting, sortingId, recording, curationDispatch, onSetExternalUnitMetrics } = props
  const { workspaceName, feedUri, readOnly } = workspaceInfo;
  const [externalUnitMetricsStatus, setExternalUnitMetricsStatus] = useState<CalcStatus>('waiting');
  //const initialSortingSelection: SortingSelection = {currentTimepoint: 1000, animation: {currentTimepointVelocity: 100, lastUpdateTimestamp: Number(new Date())}}
  const initialSortingSelection: SortingSelection = {}
  const [selection, selectionDispatch] = useReducer(sortingSelectionReducer, initialSortingSelection)
  
  const sortingInfo = useSortingInfo(sorting?.sortingObject, sorting?.recordingObject)
  const recordingInfo = useRecordingInfo(recording?.recordingObject)

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

  const sv = plugins.sortingViews['MVSortingView']
  if (!sv) throw Error('Missing sorting view: MVSortingView')
  const svProps = useMemo(() => (sv.props || {}), [sv.props])

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
            plugins={plugins}
            calculationPool={calculationPool}
            width={contentWidth}
            height={contentHeight}
          />
      </div>
      <div style={footerStyle}>
          {`Sorting: `}
          <Link to={`/${workspaceName}/sorting/${sorting.sortingId}/${getPathQuery({feedUri})}`}>
            {sorting.sortingLabel}
          </Link>
          {` | Recording: `}
          <Link to={`/${workspaceName}/recording/${recording.recordingId}/${getPathQuery({feedUri})}`}>
            {recording.recordingLabel}
          </Link>
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

function findSortingForId(state: any, id: string): Sorting | undefined {
  return state.sortings.filter((s: any) => (s.sortingId === id)).map((s: any) => (s as any as Sorting))[0]
}

function findRecordingForId(state: any, id: string): Recording | undefined {
  return state.recordings.filter((s: any) => (s.recordingId === id)).map((s: any) => (s as any as Recording))[0]
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({ // todo
  plugins: filterPlugins(state.plugins),
  // todo: use selector
  sorting: findSortingForId(state, ownProps.sortingId),
  recording: findRecordingForId(state, (findSortingForId(state, ownProps.sortingId) || {recordingId: ''}).recordingId),
  extensionsConfig: state.extensionsConfig
})

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => {
  const curationDispatch = (a: SortingCurationAction) => {
    if (a.type === 'SetCuration') {
      dispatch({type: 'SET_CURATION', sortingId: ownProps.sortingId, curation: a.curation, persistKey: 'sortings'})
    }
    else if (a.type === 'AddLabel') {
      dispatch({type: 'ADD_UNIT_LABEL', sortingId: ownProps.sortingId, unitId: a.unitId, label: a.label, persistKey: 'sortings'})
    }
    else if (a.type === 'RemoveLabel') {
      dispatch({type: 'REMOVE_UNIT_LABEL', sortingId: ownProps.sortingId, unitId: a.unitId, label: a.label, persistKey: 'sortings'})
    }
    else if (a.type === 'MergeUnits') {
      dispatch({type: 'MERGE_UNITS', sortingId: ownProps.sortingId, unitIds: a.unitIds, persistKey: 'sortings'})
    }
    else if (a.type === 'UnmergeUnits') {
      dispatch({type: 'UNMERGE_UNITS', sortingId: ownProps.sortingId, unitIds: a.unitIds, persistKey: 'sortings'})
    }
  }
  return {
    onSetExternalUnitMetrics: (a: { sortingId: string, externalUnitMetrics: ExternalSortingUnitMetric[] }) => dispatch(setExternalSortingUnitMetrics(a)),
    curationDispatch
  }
}

export default withRouter(connect<StateProps, DispatchProps, OwnProps, RootState>(
  mapStateToProps,
  mapDispatchToProps
)(SortingView))