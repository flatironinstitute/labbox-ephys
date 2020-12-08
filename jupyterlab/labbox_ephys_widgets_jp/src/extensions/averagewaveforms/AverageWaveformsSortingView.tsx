import React from 'react';
import createCalculationPool from '../common/createCalculationPool';
import PlotGrid from '../common/PlotGrid';
import { SortingViewProps } from '../extensionInterface';
import AverageWaveform_rv from './AverageWaveform_ReactVis';

const averageWaveformsCalculationPool = createCalculationPool({maxSimultaneous: 6});

const AverageWaveformsSortingView: React.FunctionComponent<SortingViewProps> = ({ sorting, recording, selectedUnitIds, focusedUnitId, onUnitClicked, hither }) => {
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
            hither={hither}
        />
    );
}

export default AverageWaveformsSortingView