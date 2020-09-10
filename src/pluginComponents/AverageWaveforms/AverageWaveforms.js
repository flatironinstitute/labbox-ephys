import React from 'react'
import PlotGrid from '../../components/PlotGrid';
import AverageWaveform_rv from './AverageWaveform_ReactVis';
import sampleSortingViewProps from '../common/sampleSortingViewProps'
import CalculationPool from '../common/CalculationPool';

const averageWaveformsCalculationPool = new CalculationPool({maxSimultaneous: 6});

const AverageWaveforms = ({ sorting, recording, selectedUnitIds, focusedUnitId,
    onUnitClicked }) => {
    return (
        <PlotGrid
            sorting={sorting}
            selections={selectedUnitIds}
            focus={focusedUnitId}
            onUnitClicked={onUnitClicked}
            dataFunctionName={'createjob_fetch_average_waveform_plot_data'}
            dataFunctionArgsCallback={(unitId) => ({
                sorting_object: sorting.sortingObject,
                recording_object: recording.recordingObject,
                unit_id: unitId
            })}
            // use default boxSize
            plotComponent={AverageWaveform_rv}
            plotComponentArgsCallback={(unitId) => ({
                id: 'plot-'+unitId
            })}
            newHitherJobMethod={true}
            calculationPool={averageWaveformsCalculationPool}
        />
    );
}

const label = 'Average waveforms'

AverageWaveforms.sortingViewPlugin = {
    label: label
}

AverageWaveforms.prototypeViewPlugin = {
    label: label,
    props: sampleSortingViewProps()
}

export default AverageWaveforms