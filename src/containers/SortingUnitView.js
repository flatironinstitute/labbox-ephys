import { Accordion, AccordionDetails, AccordionSummary, Button, Grid } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import { withSize } from 'react-sizeme'
import { createHitherJob } from '../hither'
import { getPathQuery } from '../kachery'
import CalculationPool from '../pluginComponents/common/CalculationPool'
import IndividualUnit from '../pluginComponents/IndividualUnits/IndividualUnit'
import SimilarUnit from './SimilarUnit'

const calculationPool = new CalculationPool({ maxSimultaneous: 6 });

const SortingUnitView = ({ sortingId, unitId, sorting, recording, extensionsConfig, documentInfo, size, sortingUnitViews }) => {
  const { documentId, feedUri, readOnly } = documentInfo;

  const [sortingInfoStatus, setSortingInfoStatus] = useState(null);
  const [sortingInfo, setSortingInfo] = useState(null);

  const effect = async () => {
    if (sortingInfoStatus === null) {
      setSortingInfoStatus('computing');
      const sortingInfo = await createHitherJob(
        'createjob_get_sorting_info',
        { sorting_object: sorting.sortingObject, recording_object: recording.recordingObject },
        { kachery_config: {}, useClientCache: true, wait: true, newHitherJobMethod: true}
      );
      setSortingInfo(sortingInfo);
      setSortingInfoStatus('finished');
    }
  }
  useEffect(() => {effect()});
  
  return (
    <div>
      <h3>
        {recording.recordingLabel} {` `}
        <Link to={`/${documentId}/sorting/${sorting.sortingId}/${getPathQuery({feedUri})}`}>
          {sorting.sortingLabel}
        </Link>
        {` Unit: `} {unitId}
      </h3>
      <Grid container direction="column">
        <Grid item key={1}>
          <IndividualUnit
            sorting={sorting}
            recording={recording}
            unitId={unitId}
            calculationPool={calculationPool}
            width={size.width}
            sortingInfo={sortingInfo}
            sortingUnitViews={sortingUnitViews}
          />
        </Grid>
        <Grid item key={2}>
          <Expandable label="Similar units">
            <SimilarUnitsView
              sorting={sorting}
              recording={recording}
              unitId={unitId}
              width={size.width}
              calculationPool={calculationPool}
            />
          </Expandable>
        </Grid>
      </Grid>
    </div>

  )
}

const SimilarUnitsView = ({ sorting, recording, unitId, width, calculationPool }) => {
  const [calculationStatus, setCalculationStatus] = useState('pending');
  const [similarUnits, setSimilarUnits] = useState(null);
  const [calculationError, setCalculationError] = useState('');

  const maxUnitsVisibleIncrement = 4;
  const [maxUnitsVisible, setMaxUnitsVisible] = useState(4);

  const effect = async () => {
    if (calculationStatus === 'pending') {
      setCalculationStatus('calculating');
      try {
        const x = await createHitherJob(
          'createjob_get_similar_units',
          {
            sorting_object: sorting.sortingObject,
            recording_object: recording.recordingObject
          },
          {
            wait: true,
            useClientCache: true,
            newHitherJobMethod: true
          }
        )
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
  let similarUnitsArray = similarUnits;
  if (similarUnits.length > maxUnitsVisible) {
      similarUnitsArray = similarUnitsArray.slice(0, maxUnitsVisible);
      showExpandButton = true;
  }

  return (
    <Grid container direction="column">
      {
        similarUnitsArray.map(su => (
          <Grid item key={su.unit_id}>
            <h3>Unit {su.unit_id}</h3>
            <SimilarUnit
              sorting={sorting}
              recording={recording}
              unitId={su.unit_id}
              compareUnitId={unitId}
              calculationPool={calculationPool}
              width={width}
            />
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

const Expandable = ({ label, children }) => {
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

function findSortingForId(state, id) {
  return state.sortings.filter(s => (s.sortingId === id))[0];
}

function findRecordingForId(state, id) {
  return state.recordings.filter(s => (s.recordingId === id))[0];
}

const mapStateToProps = (state, ownProps) => {
  return {
    sortingUnitViews: state.extensionContext.sortingUnitViews,
    // todo: use selector
    sorting: findSortingForId(state, ownProps.sortingId),
    recording: findRecordingForId(state, (findSortingForId(state, ownProps.sortingId) || {}).recordingId),
    extensionsConfig: state.extensionsConfig,
    documentInfo: state.documentInfo
  }
}

const mapDispatchToProps = dispatch => ({
})

export default withSize()(withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(SortingUnitView)))
