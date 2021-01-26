import { Grid } from '@material-ui/core';
import React, { FunctionComponent } from 'react';
import { WorkspaceInfo } from '../AppContainer';
import RecordingInfoView from '../components/RecordingInfoView';
import SortingsView from '../components/SortingsView';
import { useRecordingInfo } from '../extensions/common/getRecordingInfo';
import { createCalculationPool } from '../extensions/common/hither';
import { Plugins, RecordingSelectionAction } from '../extensions/extensionInterface';
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
  workspaceRouteDispatch: WorkspaceRouteDispatch
}

const calculationPool = createCalculationPool({maxSimultaneous: 6})

const WorkspaceRecordingView: FunctionComponent<Props> = ({ recording, sortings, workspaceInfo, plugins, workspaceRouteDispatch }) => {
  const { readOnly } = workspaceInfo;
  const recordingInfo = useRecordingInfo(recording.recordingObject)
  if (!recordingInfo) return <div>Loading recording info</div>

  const handleImportSortings = () => {
    console.info('not yet implemented')
  }

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
                recordingSelection={{}}
                recordingSelectionDispatch={(a: RecordingSelectionAction) => {}}
                plugins={plugins}
              />
            </Expandable>
          ))
      }
    </div>
  )
}

export default WorkspaceRecordingView