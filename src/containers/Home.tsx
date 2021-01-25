import { Typography } from '@material-ui/core';
import React, { Dispatch, FunctionComponent } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RootAction, RootState } from '../reducers';
import { WorkspaceInfo } from '../reducers/workspaceInfo';
import './Home.css';
import RecordingsView from './RecordingsView';

interface StateProps {
  workspaceInfo: WorkspaceInfo
}

interface DispatchProps {
}

interface OwnProps {
  width?: number
  height?: number
}

type Props = StateProps & DispatchProps & OwnProps

const Home: FunctionComponent<Props> = ({ workspaceInfo, width, height }) => {
  const { workspaceName, feedUri, readOnly } = workspaceInfo;
  const hMargin = 30
  const vMargin = 20
  const W = (width || 600) - hMargin * 2
  const H = (height || 600) - vMargin * 2
  console.log('height of home', H)
  return (
    <div style={{marginLeft: hMargin, marginRight: hMargin, marginTop: vMargin, marginBottom: vMargin}}>
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
      <div
        style={{position: 'absolute', top: 50 + vMargin, width: W, height: H - 50}}
      >
        <RecordingsView
          width={W}
          height={H - 50}
        />
      </div>
    </div>
  );
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
  workspaceInfo: state.workspaceInfo
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(Home)