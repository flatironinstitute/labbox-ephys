import { Accordion, AccordionDetails, AccordionSummary, Button, Grid } from '@material-ui/core';
import { CalculationPool, createCalculationPool, HitherContext } from 'labbox';
import React, { FunctionComponent, useCallback, useContext, useEffect, useState } from 'react';
import sizeMe, { SizeMeProps } from 'react-sizeme';
import Hyperlink from '../python/labbox_ephys/extensions/common/Hyperlink';
import { useSortingInfo } from '../python/labbox_ephys/extensions/common/useSortingInfo';
import IndividualUnit from '../python/labbox_ephys/extensions/devel/IndividualUnits/IndividualUnit';
import { Recording, Sorting, WorkspaceRouteDispatch } from '../python/labbox_ephys/extensions/pluginInterface';

type Props = {
    sortingId: string
    sorting: Sorting
    recording: Recording
    unitId: number
    workspaceRouteDispatch: WorkspaceRouteDispatch
} & SizeMeProps

const calculationPool = createCalculationPool({ maxSimultaneous: 6 });

const SortingUnitView: FunctionComponent<Props> = ({ sortingId, unitId, sorting, recording, workspaceRouteDispatch, size }) => {
  // const plugins = useLabboxPlugins<LabboxPlugin>()

  const sortingInfo = useSortingInfo(sorting.sortingObject, sorting.recordingObject)
  const handleClickSorting = useCallback(() => {
    workspaceRouteDispatch({type: 'gotoSortingPage', recordingId: recording.recordingId, sortingId})
  }, [workspaceRouteDispatch, sortingId, recording])
  
  const width = size.width
  if (!width) return <div>No width</div>
  if (!sortingInfo) return <div>No sorting info</div>
  
  return (
    <div>
      <h3>
        {recording.recordingLabel} {` `}
        <Hyperlink onClick={handleClickSorting}>
          {sorting.sortingLabel}
        </Hyperlink>
        {` Unit: `} {unitId}
      </h3>
      <Grid container direction="column">
        <Grid item key={1}>
          <IndividualUnit
            sorting={sorting}
            recording={recording}
            unitId={unitId}
            calculationPool={calculationPool}
            width={width}
            sortingInfo={sortingInfo}
          />
        </Grid>
        <Grid item key={2}>
          <Expandable label="Similar units">
            <SimilarUnitsView
              sorting={sorting}
              recording={recording}
              unitId={unitId}
              width={width}
              calculationPool={calculationPool}
            />
          </Expandable>
        </Grid>
      </Grid>
    </div>
  )
}

const SimilarUnitsView: FunctionComponent<{
  sorting: Sorting, recording: Recording, unitId: number, width: number, calculationPool: CalculationPool
}> = ({ sorting, recording, unitId, width, calculationPool }) => {
  const hither = useContext(HitherContext)
  const [calculationStatus, setCalculationStatus] = useState('pending');
  const [similarUnits, setSimilarUnits] = useState<{unit_id: number}[] | null>(null);
  const [calculationError, setCalculationError] = useState('');

  const maxUnitsVisibleIncrement = 4;
  const [maxUnitsVisible, setMaxUnitsVisible] = useState(4);

  const effect = async () => {
    if (calculationStatus === 'pending') {
      setCalculationStatus('calculating');
      try {
        const x = await hither.createHitherJob(
          'createjob_get_similar_units',
          {
            sorting_object: sorting.sortingObject,
            recording_object: recording.recordingObject
          },
          {
            useClientCache: true
          }
        ).wait()
        setSimilarUnits(x[unitId]);
        setCalculationStatus('finished');
      }
      catch (err) {
        console.error(err);
        setCalculationError(err.message);
        setCalculationStatus('error');
        return;
      }
    }
  }
  useEffect(() => { effect() });

  if (calculationStatus === 'calculating') {
    return <div>Finding similar units</div>;
  }
  else if (calculationStatus === 'error') {
    return <div>ERROR: <pre>{calculationError}</pre></div>;
  }
  else if (calculationStatus !== 'finished') {
    return <div>Unexpected calculation status: <pre>{calculationStatus}</pre></div>;
  }

  let showExpandButton = false;
  let similarUnitsArray: {unit_id: number}[] = []
  if (similarUnits) {
    if ((similarUnits) && (similarUnits.length > maxUnitsVisible)) {
        similarUnitsArray = similarUnits.slice(0, maxUnitsVisible)
        showExpandButton = true;
    }
    else {
      similarUnitsArray = similarUnits
    }
  }

  return (
    <Grid container direction="column">
      {
        similarUnitsArray.map(su => (
          <Grid item key={su.unit_id}>
            <h3>Unit {su.unit_id}</h3>
            {/* <SimilarUnit
              sorting={sorting}
              recording={recording}
              unitId={su.unit_id}
              compareUnitId={unitId}
              calculationPool={calculationPool}
              width={width}
            /> */}
          </Grid>
        ))
      }
      {
        showExpandButton ? (
          <Grid item key="expand">
            <Button onClick={() => { setMaxUnitsVisible(maxUnitsVisible + maxUnitsVisibleIncrement) }}>Show more similar units</Button>
          </Grid>
        ) : (
            (similarUnitsArray.length === 0) &&
            <div>No similar units</div>
          )
      }
    </Grid>
  );
}

const Expandable: FunctionComponent<{label: string, children: React.ReactChild}> = ({ label, children }) => {
  return (
    <Accordion TransitionProps={{ timeout: -1, unmountOnExit: true }}>
      <AccordionSummary>
        {label}
      </AccordionSummary>
      <AccordionDetails>
        {children}
      </AccordionDetails>
    </Accordion>
  )
}

// function findSortingForId(state: RootState, id: string) {
//   return state.sortings.filter(s => (s.sortingId === id))[0];
// }

// function findRecordingForId(state: RootState, id: string) {
//   return state.recordings.filter(s => (s.recordingId === id))[0];
// }

export default sizeMe()(SortingUnitView)