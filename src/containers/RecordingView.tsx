import { Grid } from '@material-ui/core';
import React, { Dispatch, FunctionComponent } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { createCalculationPool } from '../extensions/common/hither';
import { useRecordingInfo } from '../extensions/common/useRecordingInfo';
import { filterPlugins, Plugins, Recording, RecordingSelectionAction, Sorting } from '../extensions/extensionInterface';
import sortByPriority from '../extensions/sortByPriority';
import { WorkspaceInfo } from '../extensions/WorkspaceView';
import RecordingInfoView from '../extensions/WorkspaceView/RecordingInfoView';
import { Expandable } from '../extensions/WorkspaceView/SortingView';
import { RootAction, RootState } from '../reducers';

interface StateProps {
  plugins: Plugins
}

interface DispatchProps {
}

interface OwnProps {
  recordingId: string
  recording: Recording
  sortings: Sorting[]
  workspaceInfo: WorkspaceInfo
}

const calculationPool = createCalculationPool({maxSimultaneous: 6})

type Props = StateProps & DispatchProps & OwnProps & RouteComponentProps

const RecordingView: FunctionComponent<Props> = ({ recordingId, recording, sortings, history, workspaceInfo, plugins }) => {
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
          sortByPriority(plugins.recordingViews).filter(rv => (!rv.disabled)).map(rv => (
            <Expandable label={rv.label} defaultExpanded={rv.defaultExpanded ? true : false} key={'rv-' + rv.name}>
              <rv.component
                key={'rvc-' + rv.name}
                calculationPool={calculationPool}
                recording={recording}
                recordingInfo={recordingInfo}
                selection={{}}
                selectionDispatch={(a: RecordingSelectionAction) => {}}
                plugins={plugins}
              />
            </Expandable>
          ))
      }
    </div>
  )
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
  plugins: filterPlugins(state.plugins)
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
})

export default withRouter(connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)( RecordingView))