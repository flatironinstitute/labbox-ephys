import React from 'react'
import Correlogram_rv from '../CrossCorrelograms/Correlogram_ReactVis';
import PlotGrid from '../../components/PlotGrid';
import sampleSortingViewProps from '../common/sampleSortingViewProps'

const AutoCorrelograms = ({ sorting, selectedUnitIds, focusedUnitId,
    onUnitClicked }) => {
    return (
        <PlotGrid
            sorting={sorting}
            selections={selectedUnitIds}
            focus={focusedUnitId}
            onUnitClicked={onUnitClicked}
            dataFunctionName={'fetch_correlogram_plot_data'}
            dataFunctionArgsCallback={(unitId) => ({
                sorting_object: sorting.sortingObject,
                unit_x: unitId
            })}
            // use default boxSize
            plotComponent={Correlogram_rv}
            plotComponentArgsCallback={(unitId) => ({
                id: 'plot-'+unitId
            })}
        />
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