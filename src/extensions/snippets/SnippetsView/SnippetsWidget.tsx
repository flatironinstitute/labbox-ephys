import { Grid } from '@material-ui/core';
import React, { FunctionComponent } from 'react';
import { Recording, Sorting, SortingSelection, SortingSelectionDispatch } from '../../extensionInterface';
import SnippetsWidgetBox from './SnippetsWidgetBox';

type Props = {
    recording: Recording
    sorting: Sorting
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    unitIds: number[]
    width: number
    height: number
}

const SnippetsWidget: FunctionComponent<Props> = ({ recording, sorting, selection, selectionDispatch, unitIds, width }) => {
    const noiseLevel = (recording.recordingInfo || {}).noise_level || 1  // fix this
    return (
        <Grid container>
            {
                (unitIds || []).map(unitId => (
                    <Grid item key={unitId}>
                        <SnippetsWidgetBox {...{recording, sorting, selection, selectionDispatch, unitId, height: 150, noiseLevel}} />
                    </Grid>
                ))
            }
        </Grid>
    )
}

export default SnippetsWidget