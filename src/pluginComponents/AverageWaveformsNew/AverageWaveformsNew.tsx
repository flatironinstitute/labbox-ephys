// LABBOX-EXTENSION: AverageWaveformsNew

import React from 'react';
import PlotGrid from '../../components/PlotGrid';
import { ExtensionContext, SortingViewProps } from '../../extension';
import CalculationPool from '../common/CalculationPool';
import AverageWaveformPlotNew from './AverageWaveformPlotNew';

const averageWaveformsCalculationPool = new CalculationPool({maxSimultaneous: 6});

const AverageWaveformsNew: React.FunctionComponent<SortingViewProps> = (props) => {
    return (
        <PlotGrid
            sorting={props.sorting}
            selections={props.selectedUnitIds}
            focus={props.focusedUnitId}
            onUnitClicked={props.onUnitClicked}
            dataFunctionName={'createjob_fetch_average_waveform_plot_data'}
            dataFunctionArgsCallback={(unitId: number) => ({
                sorting_object: props.sorting.sortingObject,
                recording_object: props.recording.recordingObject,
                unit_id: unitId
            })}
            // use default boxSize
            plotComponent={AverageWaveformPlotNew}
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
        name: 'AverageWaveformsNew',
        label: 'Average waveforms new',
        component: AverageWaveformsNew
    })
}