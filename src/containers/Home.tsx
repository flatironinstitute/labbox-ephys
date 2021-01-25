import { Button, Typography } from '@material-ui/core';
import React, { Dispatch, FunctionComponent } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { Link } from 'react-router-dom';
import { getPathQuery } from '../kachery';
import { RootAction, RootState } from '../reducers';
import { DocumentInfo } from '../reducers/documentInfo';
import './Home.css';
import RecordingsTable from './RecordingsTable';

interface StateProps {
  documentInfo: DocumentInfo
}

interface DispatchProps {
}

interface OwnProps {
}

type Props = StateProps & DispatchProps & OwnProps

const Home: FunctionComponent<Props> = ({ documentInfo }) => {
  const { documentId, feedUri, readOnly } = documentInfo;
  return (
    <div style={{margin: 30}}>
      {
        readOnly && (
          <Typography component="p" style={{fontStyle: "italic"}}>
            VIEW ONLY
          </Typography>
        )
      }
      <Typography component="p">
        Analysis and visualization of neurophysiology recordings and spike sorting results.
      </Typography>
      <p />
      {
        !readOnly && (
          <div>
            <Button component={Link} to={`/${documentId}/importRecordings${getPathQuery({feedUri})}`}>Import recordings</Button>
          </div>
        )
      }
      <RecordingsTable />
    </div>
  );
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
  documentInfo: state.documentInfo
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(Home)