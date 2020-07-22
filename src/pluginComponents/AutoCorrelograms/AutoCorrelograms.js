import React from 'react'
import { Grid } from '@material-ui/core';
import ClientSidePlot from '../../components/ClientSidePlot';
import plotStyles from '../common/plotStyles';
import Correlogram_rv from '../CrossCorrelograms/Correlogram_ReactVis';
import sampleSortingViewProps from '../common/sampleSortingViewProps'

const AutoCorrelograms = ({ sorting, isSelected=() => {}, isFocused=() => {}, onUnitClicked }) => {
    return (
        <Grid container>
            {
                sorting.sortingInfo.unit_ids.map(unitId => (
                    <Grid key={unitId} item>
                        <div style={plotStyles['plotWrapperStyle']}
                        >
                            <div
                                style={isSelected(unitId)
                                    ? (isFocused(unitId)
                                        ? plotStyles['plotFocusedStyle']
                                        : plotStyles['plotSelectedStyle']
                                    ) : plotStyles['unselectedStyle']}
                                onClick={(event) => onUnitClicked(unitId, event)}
                            >
                                <div style={{ 'textAlign': 'center' }}>
                                    <div>Unit {unitId}</div>
                                </div>
                                <ClientSidePlot
                                    dataFunctionName='fetch_correlogram_plot_data'
                                    dataFunctionArgs={{
                                        sorting_object: sorting.sortingObject,
                                        unit_x: unitId
                                    }}
                                    boxSize={{
                                        width: 200,
                                        height: 200
                                    }}
                                    plotComponent={Correlogram_rv}
                                    plotComponentArgs={{ id: 'plot-'+unitId }}
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