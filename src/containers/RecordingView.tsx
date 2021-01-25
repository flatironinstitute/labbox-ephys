import { Grid } from '@material-ui/core';
import React, { Dispatch, FunctionComponent } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { WorkspaceInfo } from '../AppContainer';
import RecordingInfoView from '../components/RecordingInfoView';
import { useRecordingInfo } from '../extensions/common/getRecordingInfo';
import { createCalculationPool } from '../extensions/common/hither';
import { filterPlugins, Plugins, RecordingSelectionAction } from '../extensions/extensionInterface';
import sortByPriority from '../extensions/sortByPriority';
import { RootAction, RootState } from '../reducers';
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
import { Recording } from '../reducers/recordings';
=======
import { Recording, RecordingInfo } from '../reducers/recordings';
>>>>>>> import recordings view python scripts
import { Sorting } from '../reducers/sortings';
import { WorkspaceInfo } from '../reducers/workspaceInfo';
import { Expandable } from './SortingView';

interface StateProps {
  recording: Recording,
  sortings: Sorting[],
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
=======
  workspaceInfo: WorkspaceInfo,
>>>>>>> import recordings view python scripts
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

<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
const RecordingView: FunctionComponent<Props> = ({ recordingId, recording, sortings, history, workspaceInfo, plugins }) => {
  const recordingInfo = useRecordingInfo(recording.recordingObject)
=======
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
>>>>>>> import recordings view python scripts

  if (!recording) {
    return <h3>{`Recording not found: ${recordingId}`}</h3>
  }
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
  if (!recordingInfo) {
    return <h3>{`Loading recording info...`}</h3>
=======

  const handleImportSortings = () => {
    history.push(`/${workspaceName}/importSortingsForRecording/${recordingId}${getPathQuery({ feedUri })}`)
>>>>>>> import recordings view python scripts
  }

  return (
    <div style={{margin: 20}}>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <h2>{recording.recordingLabel}</h2>
          <div>{recording.recordingPath}</div>
          <RecordingInfoView recordingInfo={recordingInfo} hideElectrodeGeometry={true} />
        </Grid>

<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
        {/* <Grid item xs={12} lg={6}>
          <SortingsView sortings={sortings} onImportSortings={readOnly ? null : handleImportSortings} workspaceRouteDispatch={workspaceRouteDispatch} />
        </Grid> */}
        
=======
        <Grid item xs={12} lg={6}>
          {/* <Link to={`/${workspaceName}/runSpikeSortingForRecording/${recordingId}${getPathQuery({feedUri})}`}>Run spike sorting</Link> */}
          <SortingsView sortings={sortings} onImportSortings={readOnly ? null : handleImportSortings} />
        </Grid>
>>>>>>> import recordings view python scripts
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
<<<<<<< aecffccec7401ef3fe6951958578928f0b85c04b
=======
  workspaceInfo: state.workspaceInfo,
>>>>>>> import recordings view python scripts
  plugins: filterPlugins(state.plugins)
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
})

export default withRouter(connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)( RecordingView))