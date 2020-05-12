import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import SortingInfoView from '../components/SortingInfoView';
import { CircularProgress, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import { setSortingInfo, createHitherJob } from '../actions';
import * as pluginComponents from '../pluginComponents';

const pluginComponentsList = Object.values(pluginComponents).filter(PluginComponent => (PluginComponent.sortingViewPlugin));

const SortingView = ({ sortingId, sorting, recording, onSetSortingInfo }) => {
  const [sortingInfoStatus, setSortingInfoStatus] = useState(null);
  const effect = async () => {
    if ((sorting) && (recording) && (!sorting.sortingInfo)) {
      setSortingInfoStatus('computing');
      const sortingInfoJob = await createHitherJob(
        'get_sorting_info',
        { sorting_path: sorting.sortingPath, recording_path: recording.recordingPath },
        { kachery_config: {} }
      );
      const sortingInfo = await sortingInfoJob.wait();
      onSetSortingInfo({ sortingId, sortingInfo });
      setSortingInfoStatus('');
    }
  }
  useEffect(() => {effect()});

  if (!sorting) {
    return <h3>{`Sorting not found: ${sortingId}`}</h3>
  }

  return (
    <div>
      <h3>{`Sorting: ${sortingId} for ${sorting.recordingId}`}</h3>
      {
        (sortingInfoStatus === 'computing') ? (
          <div><CircularProgress /></div>
        ) : (
          <SortingInfoView sortingInfo={sorting.sortingInfo} />
        )
      }
      <div>
        {
          pluginComponentsList.map(PluginComponent => {
            const config = PluginComponent.sortingViewPlugin;
            return (
              <Expandable
                key={config.label}
                label={config.label}
              >
                <PluginComponent
                  {...config.props || {}}
                  sorting={sorting}
                />
              </Expandable>
            )
          })
        }
      </div>
    </div>
  );
}

const Expandable = ({ label, children }) => {
  return (
    <ExpansionPanel TransitionProps={{ unmountOnExit: true }}>
      <ExpansionPanelSummary>
        {label}
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        {children}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  )
}

function findSortingForId(state, id) {
  return state.sortings.filter(s => (s.sortingId === id))[0];
}

function findRecordingForId(state, id) {
  return state.recordings.filter(s => (s.recordingId === id))[0];
}

const mapStateToProps = (state, ownProps) => ({
  // todo: use selector
  sorting: findSortingForId(state, ownProps.sortingId),
  recording: findRecordingForId(state, (findSortingForId(state, ownProps.sortingId) || {}).recordingId)
})

const mapDispatchToProps = dispatch => ({
  onSetSortingInfo: ({ sortingId, sortingInfo }) => dispatch(setSortingInfo({ sortingId, sortingInfo }))
})

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(SortingView))
