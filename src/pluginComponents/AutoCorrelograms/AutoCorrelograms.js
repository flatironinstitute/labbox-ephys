import React from 'react'
import MatplotlibPlot from '../../components/MatplotlibPlot';
import { Grid } from '@material-ui/core';
import plotStyles from '../common/plotStyles';
import sampleSortingViewProps from '../common/sampleSortingViewProps'

const AutoCorrelograms = ({ sorting, isSelected, isFocused, onUnitClicked }) => {
    return (
        <Grid container>
            {
                sorting.sortingInfo.unit_ids.map(unitId => (
                    <Grid key={unitId} item>
                        <div style={plotStyles['plotWrapperStyle']}
                        >
                            <div
                                style={(isSelected && isSelected(unitId))
                                    ? ((isFocused && isFocused(unitId))
                                        ? plotStyles['plotFocusedStyle']
                                        : plotStyles['plotSelectedStyle']
                                    ) : plotStyles['unselectedStyle']}
                                onClick={(event) => onUnitClicked(unitId, event)}
                            >
                                <div style={{ 'textAlign': 'center' }}>
                                    <div>Unit {unitId}</div>
                                </div>
                                <MatplotlibPlot
                                    functionName='genplot_autocorrelogram'
                                    functionArgs={{
                                        sorting_object: sorting.sortingObject,
                                        unit_id: unitId
                                    }}
                                />
                            </div>
                        </div>
                    </Grid>
                ))
            }
        </Grid>
    );
}

const label = 'Autocorrelograms'

AutoCorrelograms.sortingViewPlugin = {
    label: label
}

AutoCorrelograms.prototypeViewPlugin = {
    label: label,
    props: sampleSortingViewProps()
}

export default AutoCorrelograms