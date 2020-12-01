import React from 'react';
import PlotGrid from '../../components/PlotGrid';
import { Recording } from '../../reducers/recordings';
import { Sorting } from '../../reducers/sortings';
import CalculationPool from '../common/CalculationPool';
import sampleSortingViewProps from '../common/sampleSortingViewProps';
import AverageWaveformPlotNew from './AverageWaveformPlotNew';

const averageWaveformsCalculationPool = new CalculationPool({maxSimultaneous: 6});

interface Props {
    sorting: Sorting
    recording: Recording
    selectedUnitIds: {[key: number]: true} // string or number keys?
    focusedUnitId: number
    onUnitClicked: (unitId: number, event: any) => void
}

const AverageWaveformsNew = (props: Props) => {
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

const label = 'Average waveforms new'

AverageWaveformsNew.sortingViewPlugin = {
    label: label
}

AverageWaveformsNew.prototypeViewPlugin = {
    label: label,
    props: sampleSortingViewProps()
}

export default AverageWaveformsNew