import React from 'react';
import createCalculationPool from '../common/createCalculationPool';
import PlotGrid from '../common/PlotGrid';
import { SortingViewProps } from '../extensionInterface';
import Correlogram_rv from './Correlogram_ReactVis';

const autocorrelogramsCalculationPool = createCalculationPool({maxSimultaneous: 6});

const AutoCorrelograms: React.FunctionComponent<SortingViewProps> = ({ sorting, selectedUnitIds, focusedUnitId, onUnitClicked, hither }) => {
    return (
        <PlotGrid
            sorting={sorting}
            selections={selectedUnitIds}
            focus={focusedUnitId}
            onUnitClicked={onUnitClicked}
            dataFunctionName={'createjob_fetch_correlogram_plot_data'}
            dataFunctionArgsCallback={(unitId: number) => ({
                sorting_object: sorting.sortingObject,
                unit_x: unitId
            })}
            // use default boxSize
            plotComponent={Correlogram_rv}
            plotComponentArgsCallback={(unitId: number) => ({
                id: 'plot-'+unitId
            })}
            newHitherJobMethod={true}
            calculationPool={autocorrelogramsCalculationPool}
            useJobCache={true}
            hither={hither}
        />
    );
}

export default AutoCorrelograms