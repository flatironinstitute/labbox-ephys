import React, { FunctionComponent, useMemo } from 'react';
import SortingUnitPlotGrid from '../../common/SortingUnitPlotGrid';
import { SortingViewProps } from "../../extensionInterface";
import AverageWaveformView2 from './AverageWaveformView2';

const AverageWaveformsView: FunctionComponent<SortingViewProps> = (props) => {
    const {recording, sorting, selection, selectionDispatch} = props
    const boxHeight = 250
    const boxWidth = 180

    const noiseLevel = (recording.recordingInfo || {}).noise_level || 1  // fix this
    const unitComponent = useMemo(() => (unitId: number) => (
        <AverageWaveformView2
            {...{sorting, recording, unitId, selection, selectionDispatch}}
            width={boxWidth}
            height={boxHeight}
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
    );
}

export default AverageWaveformsView