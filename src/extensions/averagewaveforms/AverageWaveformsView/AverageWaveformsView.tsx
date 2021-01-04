import React, { FunctionComponent, useMemo } from 'react';
import SortingUnitPlotGrid from '../../common/SortingUnitPlotGrid';
import { SortingViewProps } from "../../extensionInterface";
import AverageWaveformView2 from './AverageWaveformView2';

const AverageWaveformsView: FunctionComponent<SortingViewProps> = (props) => {
    const {recording, sorting, selection, selectionDispatch} = props
    // const selectedUnitIdsLookup: {[key: string]: boolean} = (selection.selectedUnitIds || []).reduce((m, uid) => {m[uid + ''] = true; return m}, {} as {[key: string]: boolean})
    // const handleUnitClicked = useCallback((unitId: number, event: {ctrlKey?: boolean, shiftKey?: boolean}) => {
    //     selectionDispatch({
    //         type: 'UnitClicked',
    //         unitId,
    //         ctrlKey: event.ctrlKey,
    //         shiftKey: event.shiftKey
    //     })
    // }, [selectionDispatch])

    const noiseLevel = (recording.recordingInfo || {}).noise_level || 1  // fix this
    const unitComponent = useMemo(() => (unitId: number) => (
        <AverageWaveformView2
            {...{sorting, recording, unitId, selection, selectionDispatch}}
            width={300}
            height={300}
            noiseLevel={noiseLevel}
        />
    ), [sorting, recording, selection, selectionDispatch, noiseLevel])


    // useCheckForChanges('AverageWaveformsView', props)

    return (
        <SortingUnitPlotGrid
            sorting={sorting}
            selection={selection}
            selectionDispatch={selectionDispatch}
            unitComponent={unitComponent}
        />
        // <PlotGrid
        //     sorting={sorting}
        //     selections={selectedUnitIdsLookup}
        //     onUnitClicked={handleUnitClicked}
        //     dataFunctionName={'createjob_fetch_average_waveform_2'}
        //     dataFunctionArgsCallback={(unitId: number) => ({
        //         sorting_object: sorting.sortingObject,
        //         recording_object: recording.recordingObject,
        //         unit_id: unitId
        //     })}
        //     // use default boxSize
        //     boxSize={{width: 300, height: 300}}
        //     plotComponent={AverageWaveformView}
        //     plotComponentArgsCallback={(unitId: number) => ({
        //         id: 'plot-'+unitId
        //     })}
        //     plotComponentPropsCallback={(unitId: number) => ({
        //         selection,
        //         selectionDispatch,
        //         noiseLevel: recording.recordingInfo?.noise_level || 1
        //     })}
        //     calculationPool={calculationPool}
        //     hither={hither}
        // />
    );
}

export default AverageWaveformsView