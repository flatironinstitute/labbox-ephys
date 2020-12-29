import React, { FunctionComponent, useCallback } from 'react';
import createCalculationPool from '../../common/createCalculationPool';
import PlotGrid from '../../common/PlotGrid';
import { SortingViewProps } from "../../extensionInterface";
import AverageWaveformView from './AverageWaveformView';

const calculationPool = createCalculationPool({maxSimultaneous: 6})

const AverageWaveformsView: FunctionComponent<SortingViewProps> = ({recording, sorting, selection, selectionDispatch, hither, recordingSelection, recordingSelectionDispatch}) => {
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
            dataFunctionName={'createjob_fetch_average_waveform_2'}
            dataFunctionArgsCallback={(unitId: number) => ({
                sorting_object: sorting.sortingObject,
                recording_object: recording.recordingObject,
                unit_id: unitId
            })}
            // use default boxSize
            boxSize={{width: 300, height: 300}}
            plotComponent={AverageWaveformView}
            plotComponentArgsCallback={(unitId: number) => ({
                id: 'plot-'+unitId
            })}
            plotComponentPropsCallback={(unitId: number) => ({
                selectedElectrodeIds: recordingSelection.selectedElectrodeIds,
                onSelectedElectrodeIdsChanged: (x: number[]) => {recordingSelectionDispatch({type: 'SetSelectedElectrodeIds', selectedElectrodeIds: x})}
            })}
            calculationPool={calculationPool}
            hither={hither}
        />
    );
}

export default AverageWaveformsView