import { Grid } from '@material-ui/core';
import React, { Dispatch, FunctionComponent } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { useRecordingInfo } from '../actions/getRecordingInfo';
import { WorkspaceInfo } from '../AppContainer';
import RecordingInfoView from '../components/RecordingInfoView';
import { createCalculationPool } from '../extensions/common/hither';
import { filterPlugins, Plugins, RecordingSelectionAction } from '../extensions/extensionInterface';
import sortByPriority from '../extensions/sortByPriority';
import { RootAction, RootState } from '../reducers';
import { Recording } from '../reducers/recordings';
import { Sorting } from '../reducers/sortings';
import { Expandable } from './SortingView';

interface StateProps {
  recording: Recording,
  sortings: Sorting[],
  plugins: Plugins
}

interface DispatchProps {
}

interface OwnProps {
  recordingId: string
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

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
  // todo: use selector
  recording: state.recordings.filter(rec => (rec.recordingId === ownProps.recordingId))[0],
  sortings: state.sortings.filter(s => (s.recordingId === ownProps.recordingId)),
  plugins: filterPlugins(state.plugins)
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
})

export default withRouter(connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)( RecordingView))