import { Grid } from '@material-ui/core';
import React, { Fragment, FunctionComponent, useCallback, useState } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import { Recording, Sorting, SortingSelection, SortingSelectionDispatch } from '../../extensionInterface';
import SnippetsRow from './SnippetsRow';

type Props = {
    recording: Recording
    sorting: Sorting
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    unitIds: number[]
    width: number
    height: number
}

const WhenVisible: FunctionComponent<{width: number, height: number}> = ({width, height, children}) => {
    const [hasBeenVisible, setHasBeenVisible] = useState(false)
    const handleVisibilityChange = useCallback((isVisible: boolean) => {
        if ((isVisible) && (!hasBeenVisible)) setHasBeenVisible(true)
    }, [hasBeenVisible, setHasBeenVisible])
    return hasBeenVisible ? <Fragment>{children}</Fragment> : (
        <VisibilitySensor onChange={handleVisibilityChange} partialVisibility={true}>
            <div className="WhenVisible" style={{position: 'absolute', width, height}}>Waiting for visible</div>
        </VisibilitySensor>
    )
}

const SnippetsWidget: FunctionComponent<Props> = ({ recording, sorting, selection, selectionDispatch, unitIds, width, height }) => {
    const noiseLevel = (recording.recordingInfo || {}).noise_level || 1  // fix this
    return (
        <div style={{position: 'absolute', width, height, overflow: 'auto'}}>
            <Grid container direction="column">
                {
                    (unitIds || []).map(unitId => (
                        <Grid item key={unitId}>
                            <WhenVisible width={width} height={150}>
                                <SnippetsRow {...{recording, sorting, selection, selectionDispatch, unitId, height: 150, noiseLevel}} />
                            </WhenVisible>
                        </Grid>
                    ))
                }
            </Grid>
        </div>
    )
}

export default SnippetsWidget