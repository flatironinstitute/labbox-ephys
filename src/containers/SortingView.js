import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { connect } from 'react-redux'
import SortingInfoView from '../components/SortingInfoView';
import { CircularProgress, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import { setSortingInfo, addUnitLabel, removeUnitLabel } from '../actions';
import { createHitherJob } from '../hither';
import * as pluginComponents from '../pluginComponents';

const pluginComponentsList = Object.values(pluginComponents).filter(PluginComponent => (PluginComponent.sortingViewPlugin));

const intrange = (a, b) => {
  const lower = a < b ? a : b;
  const upper = a < b ? b : a;
  let arr = [];
  for (let n = lower; n <= upper; n++) {
      arr.push(n);
  }
  return arr;
}

const updateSelections = (state, [mode = 'simple', target]) => {
  const focus = state['focus'] || null;
  if (focus === null && mode === 'additive') {
    mode = 'simple';
  }

  switch(mode) {
    case 'simple':  // unmodified click, or shift w/out focus set.
      // Target is toggled and set as focus. Reset any prior selections.
      return {
        'focus': target,
        [target]: !(state[target] || false)
      };
    case 'picked': // ctrl modifier in effect.
      // Toggle selected item & make it the focus. Keep other existing selections.
      return {
        ...state,
        'focus': target,
        [target]: !(state[target] || false)
      };
    case 'additive':  // shift-click w/ focus set.
      // Keep prior focus & set selection to the inclusive interval from
      // target to focus.
      // Note this does lead to entries that point nowhere when unit ids
      // are non-contiguous. Be alert to this.
      const intUnitId = parseInt(target);
      return {
        ...Object.fromEntries(intrange(intUnitId, focus).map(key => [key, true])),
        'focus': state['focus']
      };
    case 'toggle': // checkbox from new units list. It just passes the checkbox to toggle.
                   // this is identical to picked mode except we delete the focus.
      return {
        ...state,
        [target]: !(state[target] || false)
      };
    case 'exact': // from the units list, which uses checkboxes so the precise set is specified.
                  // Drop focus & reset selection to select exactly the chosen targets
                  // (which is a list in this context)
      return Object.fromEntries(Object.keys(target).map(key => [key, true]));
    default:
      alert(`Bad selection-update mode ${mode}`);
      console.log('State: ', state, "\ntarget:", target);
      return state;
  }
}

const SortingView = ({ sortingId, sorting, recording, onSetSortingInfo, onAddUnitLabel, onRemoveUnitLabel, extensionsConfig }) => {
  const [sortingInfoStatus, setSortingInfoStatus] = useState(null);
  const [selectedUnitIds, setSelectedUnitIds] = useReducer(updateSelections, {});

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

  const handleUnitClicked = useCallback((unitId, event) => {
    if (event.ctrlKey) {
      setSelectedUnitIds(['picked', unitId]);
    }
    else if (event.shiftKey) {
      setSelectedUnitIds(['additive', unitId]);
    }
    else {
      setSelectedUnitIds(['simple', unitId]);
    }
  }, [setSelectedUnitIds]);

  const sidebarWidth = '200px'

  const sidebarStyle = {
    'width': sidebarWidth,
    'height': '100%',
    'position': 'absolute',
    'zIndex': 1,
    'top': 165,
    'left': 0,
    'overflowX': 'hidden',
    'paddingTop': '20px',
    'paddingLeft': '20px'
  }

  const contentWrapperStyle = {
    'marginLeft': sidebarWidth
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
            selections={selectedUnitIds}
            focus={selectedUnitIds['focus']}
            onUnitClicked={handleUnitClicked}
            curation={sorting.unitCuration || {}}
            styling={sidebarStyle}
          />
        )
      }
      <div style={contentWrapperStyle}>
        {
          pluginComponentsList.filter(
            c => (
              (!c.sortingViewPlugin.development) || (extensionsConfig.enabled.development)
            )
          ).map(PluginComponent => {
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
                  extensionsConfig={extensionsConfig}
                  focusedUnitId={selectedUnitIds['focus']}
                  onUnitClicked={handleUnitClicked}
                  onAddUnitLabel={onAddUnitLabel}
                  onRemoveUnitLabel={onRemoveUnitLabel}
                  onSelectedUnitIdsChanged={(list) => {
                    return setSelectedUnitIds(['toggle', list]);
                  }}
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
    <Accordion TransitionProps={{ unmountOnExit: true }}>
      <AccordionSummary>
        {label}
      </AccordionSummary>
      <AccordionDetails>
        {children}
      </AccordionDetails>
    </Accordion>
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
  recording: findRecordingForId(state, (findSortingForId(state, ownProps.sortingId) || {}).recordingId),
  extensionsConfig: state.extensionsConfig
})

const mapDispatchToProps = dispatch => ({
  onSetSortingInfo: ({ sortingId, sortingInfo }) => dispatch(setSortingInfo({ sortingId, sortingInfo })),
  onAddUnitLabel: ({ sortingId, unitId, label }) => dispatch(addUnitLabel({ sortingId, unitId, label })),
  onRemoveUnitLabel: ({ sortingId, unitId, label }) => dispatch(removeUnitLabel({ sortingId, unitId, label })),
})

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(SortingView))
