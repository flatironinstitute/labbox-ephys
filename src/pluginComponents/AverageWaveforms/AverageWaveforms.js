import React from 'react'
import PlotGrid from '../../components/PlotGrid';
import AverageWaveform_rv from './AverageWaveform_ReactVis';
import sampleSortingViewProps from '../common/sampleSortingViewProps'

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