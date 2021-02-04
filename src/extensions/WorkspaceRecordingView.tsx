import { Grid } from '@material-ui/core';
import React, { FunctionComponent, useEffect, useReducer } from 'react';
import { WorkspaceInfo } from '../AppContainer';
import RecordingInfoView from '../components/RecordingInfoView';
import SortingsView from '../components/SortingsView';
import { useRecordingInfo } from '../extensions/common/getRecordingInfo';
import { createCalculationPool } from '../extensions/common/hither';
import { Plugins, RecordingSelection, recordingSelectionReducer } from '../extensions/extensionInterface';
import sortByPriority from '../extensions/sortByPriority';
import { Recording } from '../reducers/recordings';
import { Sorting } from '../reducers/sortings';
import { Expandable } from './SortingView';
import { WorkspaceRouteDispatch } from './WorkspaceView';

interface Props {
  recording: Recording
  sortings: Sorting[]
  workspaceInfo: WorkspaceInfo
  plugins: Plugins
  width: number
  height: number
  workspaceRouteDispatch: WorkspaceRouteDispatch
}

const calculationPool = createCalculationPool({maxSimultaneous: 6})

const WorkspaceRecordingView: FunctionComponent<Props> = ({ recording, sortings, workspaceInfo, plugins, workspaceRouteDispatch, width, height }) => {
  const { readOnly } = workspaceInfo;
  const recordingInfo = useRecordingInfo(recording.recordingObject)

  const handleImportSortings = () => {
    console.info('not yet implemented')
  }

  const initialRecordingSelection: RecordingSelection = {}
  const [selection, selectionDispatch] = useReducer(recordingSelectionReducer, initialRecordingSelection)

  useEffect(() => {
    if ((!selection.timeRange) && (recordingInfo)) {
      selectionDispatch({type: 'SetTimeRange', timeRange: {min: 0, max: Math.min(recordingInfo.num_frames, recordingInfo.sampling_frequency / 10)}})
    }
  }, [selection, recordingInfo])

  if (!recordingInfo) return <div>Loading recording info</div>

  return (
    <div style={{margin: 20}}>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <h2>{recording.recordingLabel}</h2>
          <div>{recording.recordingPath}</div>
          <RecordingInfoView recordingInfo={recordingInfo} hideElectrodeGeometry={true} />
        </Grid>

        <Grid item xs={12} lg={6}>
          {/* <Link to={`/${workspaceName}/runSpikeSortingForRecording/${recordingId}${getPathQuery({feedUri})}`}>Run spike sorting</Link> */}
          <SortingsView sortings={sortings} onImportSortings={readOnly ? null : handleImportSortings} workspaceRouteDispatch={workspaceRouteDispatch} workspaceInfo={workspaceInfo} />
        </Grid>
      </Grid>
      {
          sortByPriority(plugins.recordingViews).filter(rv => (!rv.disabled)).map(rv => (
            <Expandable label={rv.label} defaultExpanded={rv.defaultExpanded ? true : false} key={'rv-' + rv.name}>
              <rv.component
                key={'rvc-' + rv.name}
                calculationPool={calculationPool}
                recording={recording}
                recordingInfo={recordingInfo}
                selection={selection}
                selectionDispatch={selectionDispatch}
                plugins={plugins}
                width={width - 40}
              />
            </Expandable>
          ))
      }
    </div>
  )
}

export default WorkspaceRecordingView