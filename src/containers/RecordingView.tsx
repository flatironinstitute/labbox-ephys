import { Grid } from '@material-ui/core';
import React, { FunctionComponent } from 'react';
import { useRecordingInfo } from '../extensions/common/useRecordingInfo';
import { useLabboxPlugins, WorkspaceInfo } from '../extensions/labbox';
import { createCalculationPool } from '../extensions/labbox/hither';
import { LabboxPlugin, Recording, RecordingSelectionAction, recordingViewPlugins, Sorting } from '../extensions/pluginInterface';
import sortByPriority from '../extensions/sortByPriority';
import RecordingInfoView from '../extensions/WorkspaceView/RecordingInfoView';
import { Expandable } from '../extensions/WorkspaceView/SortingView';

type Props = {
  recordingId: string
  recording: Recording
  sortings: Sorting[]
  workspaceInfo: WorkspaceInfo
}

const calculationPool = createCalculationPool({maxSimultaneous: 6})

const RecordingView: FunctionComponent<Props> = ({ recordingId, recording, sortings, workspaceInfo }) => {
  const plugins = useLabboxPlugins<LabboxPlugin>()
  const recordingInfo = useRecordingInfo(recording.recordingObject)

  if (!recording) {
    return <h3>{`Recording not found: ${recordingId}`}</h3>
  }
  if (!recordingInfo) {
    return <h3>{`Loading recording info...`}</h3>
  }

  return (
    <div style={{margin: 20}}>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <h2>{recording.recordingLabel}</h2>
          <div>{recording.recordingPath}</div>
          <RecordingInfoView recordingInfo={recordingInfo} hideElectrodeGeometry={true} />
        </Grid>

        {/* <Grid item xs={12} lg={6}>
          <SortingsView sortings={sortings} onImportSortings={readOnly ? null : handleImportSortings} workspaceRouteDispatch={workspaceRouteDispatch} />
        </Grid> */}
        
      </Grid>
      {
          sortByPriority(recordingViewPlugins(plugins)).filter(rv => (!rv.disabled)).map(rv => (
            <Expandable label={rv.label} defaultExpanded={rv.defaultExpanded ? true : false} key={'rv-' + rv.name}>
              <rv.component
                key={'rvc-' + rv.name}
                calculationPool={calculationPool}
                recording={recording}
                recordingInfo={recordingInfo}
                selection={{}}
                selectionDispatch={(a: RecordingSelectionAction) => {}}
              />
            </Expandable>
          ))
      }
    </div>
  )
}

export default RecordingView