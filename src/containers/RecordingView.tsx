import { Grid } from '@material-ui/core';
import React, { Dispatch, FunctionComponent, useEffect } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { setRecordingInfo } from '../actions';
import { getRecordingInfo } from '../actions/getRecordingInfo';
import RecordingInfoView from '../components/RecordingInfoView';
import SortingsView from '../components/SortingsView';
import { HitherContext, RecordingViewPlugin } from '../extensions/extensionInterface';
import sortByPriority from '../extensions/sortByPriority';
import { getPathQuery } from '../kachery';
import { RootAction, RootState } from '../reducers';
import { DocumentInfo } from '../reducers/documentInfo';
import { Recording, RecordingInfo } from '../reducers/recordings';
import { Sorting } from '../reducers/sortings';
import { Expandable } from './SortingView';

interface StateProps {
  recordingViews: {[key: string]: RecordingViewPlugin},
  recording: Recording,
  sortings: Sorting[],
  documentInfo: DocumentInfo,
  hither: HitherContext
}

interface DispatchProps {
  onSetRecordingInfo: (a: { recordingId: string, recordingInfo: RecordingInfo }) => void
}

interface OwnProps {
  recordingId: string
}

type Props = StateProps & DispatchProps & OwnProps & RouteComponentProps

const RecordingView: FunctionComponent<Props> = ({ recordingId, recording, sortings, history, documentInfo, onSetRecordingInfo, recordingViews, hither }) => {
  const { documentId, feedUri, readOnly } = documentInfo;

  const effect = async () => {
    if (!recording) return;
    const rec = recording;
    if (!rec.recordingInfo) {
      try {
        const info = await getRecordingInfo({ recordingObject: rec.recordingObject, hither });
        onSetRecordingInfo({ recordingId: rec.recordingId, recordingInfo: info });
      }
      catch (err) {
        console.error(err);
        return;
      }
    }
  }
  useEffect(() => { effect() })

  if (!recording) {
    return <h3>{`Recording not found: ${recordingId}`}</h3>
  }

  const handleImportSortings = () => {
    history.push(`/${documentId}/importSortingsForRecording/${recordingId}${getPathQuery({ feedUri })}`)
  }

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <h2>{recording.recordingLabel}</h2>
          <div>{recording.recordingPath}</div>
          <RecordingInfoView recordingInfo={recording.recordingInfo} hideElectrodeGeometry={true} />
        </Grid>

        <Grid item xs={12} lg={6}>
          {/* <Link to={`/${documentId}/runSpikeSortingForRecording/${recordingId}${getPathQuery({feedUri})}`}>Run spike sorting</Link> */}
          <SortingsView sortings={sortings} onImportSortings={readOnly ? null : handleImportSortings} />
        </Grid>
      </Grid>
      {
          sortByPriority(recordingViews).filter(rv => (!rv.disabled)).map(rv => (
            <Expandable label={rv.label} defaultExpanded={rv.defaultExpanded ? true : false}>
              <rv.component
                recording={recording}
                hither={hither}
              />
            </Expandable>
          ))
      }
      <div style={{padding: 20}}>
        <Link to={`/${documentId}/timeseriesForRecording/${recordingId}${getPathQuery({ feedUri })}`}>View timeseries in new page</Link>
      </div>
    </div>
  )
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
  // todo: use selector
  recordingViews: state.extensionContext.recordingViews,
  recording: state.recordings.filter(rec => (rec.recordingId === ownProps.recordingId))[0],
  sortings: state.sortings.filter(s => (s.recordingId === ownProps.recordingId)),
  documentInfo: state.documentInfo,
  hither: state.hitherContext
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
  onSetRecordingInfo: (a: { recordingId: string, recordingInfo: RecordingInfo }) => dispatch(setRecordingInfo(a))
})

export default withRouter(connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)( RecordingView))