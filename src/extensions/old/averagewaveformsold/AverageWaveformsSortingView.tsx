import React, { useCallback } from 'react';
import createCalculationPool from '../../common/createCalculationPool';
import PlotGrid from '../../common/PlotGrid';
import { SortingViewProps } from '../../extensionInterface';
import AverageWaveform_rv from './AverageWaveform_ReactVis';

const averageWaveformsCalculationPool = createCalculationPool({maxSimultaneous: 6});

const AverageWaveformsSortingView: React.FunctionComponent<SortingViewProps> = ({ sorting, recording, selection, selectionDispatch }) => {
    const selectedUnitIdsLookup: {[key: string]: boolean} = (selection.selectedUnitIds || []).reduce((m, uid) => {m[uid + ''] = true; return m}, {} as {[key: string]: boolean})
    const handleUnitClicked = useCallback((unitId: number, event: {ctrlKey?: boolean, shiftKey?: boolean}) => {
        selectionDispatch({
            type: 'UnitClicked',
            unitId,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey
        })
    }, [selectionDispatch])
    return (
        <PlotGrid
            sorting={sorting}
            selections={selectedUnitIdsLookup}
            onUnitClicked={handleUnitClicked}
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
            calculationPool={averageWaveformsCalculationPool}
        />
    );
}

export default AverageWaveformsSortingView