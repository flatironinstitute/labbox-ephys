import { Button, Grid } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useEffect, useReducer, useState } from 'react';
import { createCalculationPool } from '../common/hither';
import Splitter from '../common/Splitter';
import { useRecordingInfo } from '../common/useRecordingInfo';
import { Plugins, Recording, RecordingSelection, recordingSelectionReducer, Sorting } from '../extensionInterface';
import sortByPriority from '../sortByPriority';
import RecordingInfoView from './RecordingInfoView';
import SortingInstructions from './SortingInstructions';
import SortingsView from './SortingsView';
import { Expandable } from './SortingView';
import { WorkspaceInfo, WorkspaceRouteDispatch } from './WorkspaceView';

interface Props {
  recording: Recording
  sortings: Sorting[]
  workspaceInfo: WorkspaceInfo
  plugins: Plugins
  width: number
  height: number
  workspaceRouteDispatch: WorkspaceRouteDispatch
  onDeleteSortings: (sortingIds: string[]) => void
  defaultFeedId: string
}

const calculationPool = createCalculationPool({ maxSimultaneous: 6 })

const WorkspaceRecordingView: FunctionComponent<Props> = ({ recording, sortings, workspaceInfo, plugins, workspaceRouteDispatch, onDeleteSortings, width, height, defaultFeedId }) => {
  const { readOnly } = workspaceInfo;
  const recordingInfo = useRecordingInfo(recording.recordingObject)
  const [showSpikeSortingInstructions, setShowSpikeSortingInstructions] = useState(false)

  const handleSpikeSorting = () => {
    setShowSpikeSortingInstructions(true)
  }

  const initialRecordingSelection: RecordingSelection = {}
  const [selection, selectionDispatch] = useReducer(recordingSelectionReducer, initialRecordingSelection)

  useEffect(() => {
    if ((!selection.timeRange) && (recordingInfo)) {
      selectionDispatch({ type: 'SetTimeRange', timeRange: { min: 0, max: Math.min(recordingInfo.num_frames, recordingInfo.sampling_frequency / 10) } })
    }
  }, [selection, recordingInfo])

  const handleBackToRecordings = useCallback(() => {
    workspaceRouteDispatch({
      type: 'gotoRecordingsPage'
    })
  }, [workspaceRouteDispatch])

  if (!recordingInfo) return <div>Loading recording info</div>

  const content = (
    <div style={{ margin: 20 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} xl={6}>
          <Button onClick={handleBackToRecordings}>Back to recordings</Button>
          <h2>{recording.recordingLabel}</h2>
          <div>{recording.recordingPath}</div>
          <RecordingInfoView recordingInfo={recordingInfo} hideElectrodeGeometry={true} />
        </Grid>

        <Grid item xs={12} xl={6}>
          {/* <Link to={`/${workspaceName}/runSpikeSortingForRecording/${recordingId}${getPathQuery({feedUri})}`}>Run spike sorting</Link> */}
          <SortingsView
            sortings={sortings}
            workspaceRouteDispatch={workspaceRouteDispatch}
            workspaceInfo={workspaceInfo}
            onDeleteSortings={onDeleteSortings}
          />
        </Grid>
      </Grid>
      {
        sortByPriority(plugins.recordingViews).filter(rv => (!rv.disabled)).map(rv => (
          <Expandable label={rv.label} defaultExpanded={rv.defaultExpanded ? true : false} key={'rv-' + rv.name}>
            <rv.component
              key={'rvc-' + rv.name}
              calculationPool={calculationPool}
              recording={recording}
              recordingInfo={recordingInfo}
              selection={selection}
              selectionDispatch={selectionDispatch}
              plugins={plugins}
              width={width - 40}
            />
          </Expandable>
        ))
      }
    </div>
  )

  return (
    <Splitter
      {...{ width, height }}
      initialPosition={300}
      positionFromRight={true}
    >
      <div>
        {
          !showSpikeSortingInstructions && (
            <div><Button onClick={handleSpikeSorting}>Spike sorting</Button></div>
          )
        }
        {content}
      </div>
      {
        showSpikeSortingInstructions && (
          <SortingInstructions
            feedUri={workspaceInfo.feedUri || 'feed://' + defaultFeedId || '<>'}
            workspaceName={workspaceInfo.workspaceName || 'default'}
            recordingId={recording.recordingId}
            recordingLabel={recording.recordingLabel}
          />
        )
      }
    </Splitter>
  )
}

export default WorkspaceRecordingView