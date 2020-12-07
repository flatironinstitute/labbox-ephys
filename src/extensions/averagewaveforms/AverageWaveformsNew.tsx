import React from 'react';
import createCalculationPool from '../common/createCalculationPool';
import PlotGrid from '../common/PlotGrid';
import { SortingViewProps } from '../extensionInterface';
import AverageWaveformPlotNew from './AverageWaveformPlotNew';

const averageWaveformsCalculationPool = createCalculationPool({maxSimultaneous: 6});

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
            hither={props.hither}
        />
    );
}

export default AverageWaveformsNew