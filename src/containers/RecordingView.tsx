import { Grid } from '@material-ui/core';
import React, { Dispatch, FunctionComponent, useContext, useEffect, useState } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { setRecordingInfo } from '../actions';
import { getRecordingInfo } from '../actions/getRecordingInfo';
import RecordingInfoView from '../components/RecordingInfoView';
import SortingsView from '../components/SortingsView';
import { createCalculationPool, HitherContext } from '../extensions/common/hither';
import { filterPlugins, Plugins, RecordingSelectionAction } from '../extensions/extensionInterface';
import sortByPriority from '../extensions/sortByPriority';
import { getPathQuery } from '../kachery';
import { RootAction, RootState } from '../reducers';
import { Recording, RecordingInfo } from '../reducers/recordings';
import { Sorting } from '../reducers/sortings';
import { WorkspaceInfo } from '../reducers/workspaceInfo';
import { Expandable } from './SortingView';

interface StateProps {
  recording: Recording,
  sortings: Sorting[],
  workspaceInfo: WorkspaceInfo,
  plugins: Plugins
}

interface DispatchProps {
  onSetRecordingInfo: (a: { recordingId: string, recordingInfo: RecordingInfo }) => void
}

interface OwnProps {
  recordingId: string
}

const calculationPool = createCalculationPool({maxSimultaneous: 6})

type Props = StateProps & DispatchProps & OwnProps & RouteComponentProps

const RecordingView: FunctionComponent<Props> = ({ recordingId, recording, sortings, history, workspaceInfo, onSetRecordingInfo, plugins }) => {
  const hither = useContext(HitherContext)
  const { workspaceName, feedUri, readOnly } = workspaceInfo;
  const [recordingInfo, setRecordingInfo] = useState<RecordingInfo | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if ((recording) && (!recordingInfo)) {
      if (recording.recordingInfo) {
        setRecordingInfo(recording.recordingInfo)
        return
      }
      getRecordingInfo({ recordingObject: recording.recordingObject, hither }).then((info: RecordingInfo) => {
        onSetRecordingInfo({recordingId: recording.recordingId, recordingInfo: info})
      }).catch((err: Error) => {
        console.error(err)
        setErrorMessage('Error getting recording info: ' + err.message)
      })
    }
  }, [recording, recording.recordingInfo, recordingInfo, hither, setErrorMessage, onSetRecordingInfo])

  if (!recording) {
    return <h3>{`Recording not found: ${recordingId}`}</h3>
  }

  const handleImportSortings = () => {
    history.push(`/${workspaceName}/importSortingsForRecording/${recordingId}${getPathQuery({ feedUri })}`)
  }

  return (
    <div style={{margin: 20}}>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <h2>{recording.recordingLabel}</h2>
          <div>{recording.recordingPath}</div>
          { errorMessage && <div>{errorMessage}</div> }
          <RecordingInfoView recordingInfo={recording.recordingInfo} hideElectrodeGeometry={true} />
        </Grid>

        <Grid item xs={12} lg={6}>
          {/* <Link to={`/${workspaceName}/runSpikeSortingForRecording/${recordingId}${getPathQuery({feedUri})}`}>Run spike sorting</Link> */}
          <SortingsView sortings={sortings} onImportSortings={readOnly ? null : handleImportSortings} />
        </Grid>
      </Grid>
      {
          sortByPriority(plugins.recordingViews).filter(rv => (!rv.disabled)).map(rv => (
            <Expandable label={rv.label} defaultExpanded={rv.defaultExpanded ? true : false} key={'rv-' + rv.name}>
              <rv.component
                key={'rvc-' + rv.name}
                calculationPool={calculationPool}
                recording={recording}
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
  workspaceInfo: state.workspaceInfo,
  plugins: filterPlugins(state.plugins)
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
  onSetRecordingInfo: (a: { recordingId: string, recordingInfo: RecordingInfo }) => dispatch(setRecordingInfo(a))
})

export default withRouter(connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)( RecordingView))