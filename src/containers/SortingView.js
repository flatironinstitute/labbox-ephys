import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import SortingInfoView from '../components/SortingInfoView';
import { CircularProgress, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import { setSortingInfo } from '../actions';
import { createHitherJob } from '../hither';
import * as pluginComponents from '../pluginComponents';

const pluginComponentsList = Object.values(pluginComponents).filter(PluginComponent => (PluginComponent.sortingViewPlugin));

const SortingView = ({ sortingId, sorting, recording, onSetSortingInfo }) => {
  const [sortingInfoStatus, setSortingInfoStatus] = useState(null);
  const [selectedUnitIds, setSelectedUnitIds] = useState({});
  const [focusedUnitId, setFocusedUnitId] = useState(null);

  const plotStyles = {
    'plotWrapperStyle': {
      'minHeight': '228px',
      'minWidth': '206px'
    },
    'plotFocusedStyle': {
      'border': 'solid 3px #4287f5',
      'backgroundColor': '#b5d1ff'
    },
    'plotSelectedStyle': {
      'border': 'solid 3px blue',
      'backgroundColor': '#b5d1ff'
    },
    'plotUnselectedStyle': {
      'border': 'solid 3px transparent'
    }
  }

  const effect = async () => {
    if ((sorting) && (recording) && (!sorting.sortingInfo)) {
      setSortingInfoStatus('computing');
      const sortingInfo = await createHitherJob(
        'get_sorting_info',
        { sorting_object: sorting.sortingObject, recording_object: recording.recordingObject },
        { kachery_config: {}, useClientCache: false, wait: true}
      );
      onSetSortingInfo({ sortingId, sortingInfo });
      setSortingInfoStatus('');
    }
  }
  useEffect(() => {effect()});

  const intrange = (a, b) => {
    const lower = a < b ? a : b;
    const upper = a < b ? b : a;
    let arr = [];
    for (let n = lower; n <= upper; n++) {
        arr.push(n);
    }
    return arr;
  }

  const isSelected = (unitId) => {
    return selectedUnitIds[unitId] || false;
  }

  const isFocused = (unitId) => {
      return (focusedUnitId ?? -1) === unitId;
  }

  const handleUnitClicked = (unitId, event) => {
    let newSelectedUnitIds = [];
    if (event.ctrlKey){
        // if ctrl modifier is set, ignore shift status, then:
        // 1. Toggle clicked element only (don't touch any existing elements) &
        // 2. Set focused id to clicked id (regardless of toggle status)
        newSelectedUnitIds = {
            ...selectedUnitIds,
            [unitId]: !(selectedUnitIds[unitId] || false)
        }
        handleFocusedUnitIdChanged(unitId);
    }
    else if (event.shiftKey && focusedUnitId) {
        // if shift modifier (without ctrl modifier) & a focus exists:
        // Set selected elements to those between focus and click, inclusive.
        const intUnitId = parseInt(unitId);
        newSelectedUnitIds = Object.fromEntries(
            intrange(intUnitId, focusedUnitId).map(key => [key, true])
        );
        // do not reset focus -- no call to onFocusedUnitIdChanged()
    }
    else {
        // simple click, or shift-click without focus.
        // Select only the clicked element, and set it to focus,
        newSelectedUnitIds = {
            [unitId]: !(selectedUnitIds[unitId] || false)
        }
        handleFocusedUnitIdChanged(isFocused(unitId) ? null : unitId);
    }
    handleSelectedUnitIdsChanged(newSelectedUnitIds);
  }

  const handleSelectedUnitIdsChanged = (selectedUnitIds) => {
    setSelectedUnitIds(selectedUnitIds);
  }

  const handleFocusedUnitIdChanged = (focusedUnitId) => {
    setFocusedUnitId(focusedUnitId);
  }

  if (!sorting) {
    return <h3>{`Sorting not found: ${sortingId}`}</h3>
  }

  return (
    <div>
      <h3>{`Sorting: ${sorting.sortingLabel} for ${recording.recordingLabel}`}</h3>
      {
        (sortingInfoStatus === 'computing') ? (
          <div><CircularProgress /></div>
        ) : (
          <SortingInfoView sortingInfo={sorting.sortingInfo}
            isSelected={isSelected}
            isFocused={isFocused}
            onUnitClicked={handleUnitClicked}
          />
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
                  recording={recording}
                  selectedUnitIds={selectedUnitIds}
                  focusedUnitId={focusedUnitId}
                  isSelected={isSelected}
                  isFocused={isFocused}
                  onUnitClicked={handleUnitClicked}
                  plotStyles={plotStyles}
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
