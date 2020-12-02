// LABBOX-EXTENSION: AverageWaveforms

import React from 'react';
import PlotGrid from '../../components/PlotGrid';
import { ExtensionContext, SortingViewProps } from '../../extension';
import CalculationPool from '../common/CalculationPool';
import AverageWaveform_rv from './AverageWaveform_ReactVis';

const averageWaveformsCalculationPool = new CalculationPool({maxSimultaneous: 6});

const AverageWaveforms: React.FunctionComponent<SortingViewProps> = ({ sorting, recording, selectedUnitIds, focusedUnitId, onUnitClicked }) => {
    return (
        <PlotGrid
            sorting={sorting}
            selections={selectedUnitIds}
            focus={focusedUnitId}
            onUnitClicked={onUnitClicked}
            dataFunctionName={'createjob_fetch_average_waveform_plot_data'}
            dataFunctionArgsCallback={(unitId: number) => ({
                sorting_object: sorting.sortingObject,
                recording_object: recording.recordingObject,
                unit_id: unitId
            })}
            // use default boxSize
            plotComponent={AverageWaveform_rv}
            plotComponentArgsCallback={(unitId: number) => ({
                id: 'plot-'+unitId
            })}
            newHitherJobMethod={true}
            calculationPool={averageWaveformsCalculationPool}
        />
    );
}

export function activate(context: ExtensionContext) {
    context.registerSortingView({
        name: 'AverageWaveforms',
        label: 'Average waveforms',
        priority: 90,
        component: AverageWaveforms
    })
}