import React from 'react'
import Correlogram_rv from '../CrossCorrelograms/Correlogram_ReactVis';
import PlotGrid from '../../components/PlotGrid';
import sampleSortingViewProps from '../common/sampleSortingViewProps'
import CalculationPool from '../common/CalculationPool'

const autocorrelogramsCalculationPool = new CalculationPool({maxSimultaneous: 6});

const AutoCorrelograms = ({ sorting, selectedUnitIds, focusedUnitId,
    onUnitClicked }) => {
    return (
        <PlotGrid
            sorting={sorting}
            selections={selectedUnitIds}
            focus={focusedUnitId}
            onUnitClicked={onUnitClicked}
            dataFunctionName={'createjob_fetch_correlogram_plot_data'}
            dataFunctionArgsCallback={(unitId) => ({
                sorting_object: sorting.sortingObject,
                unit_x: unitId
            })}
            // use default boxSize
            plotComponent={Correlogram_rv}
            plotComponentArgsCallback={(unitId) => ({
                id: 'plot-'+unitId
            })}
            newHitherJobMethod={true}
            calculationPool={autocorrelogramsCalculationPool}
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