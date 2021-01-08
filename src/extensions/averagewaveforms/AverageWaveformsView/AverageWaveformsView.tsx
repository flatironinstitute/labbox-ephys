import React, { FunctionComponent, useMemo } from 'react';
import sizeMe, { SizeMeProps } from 'react-sizeme';
import SortingUnitPlotGrid from '../../common/SortingUnitPlotGrid';
import Splitter from '../../common/Splitter';
import { SortingViewProps } from "../../extensionInterface";
import AverageWaveformView2 from './AverageWaveformView2';

const AverageWaveformsView: FunctionComponent<SortingViewProps & SizeMeProps> = (props) => {
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

    const width = props.size.width;
    const height = 650 // hard-coded as per TimeseriesForRecordingView.tsx

    if (!width) return <div>No width</div>

    return (
        <div>
            <Splitter
                width={width}
                height={height}
                initialPosition={400}
            >
                {
                    <div>Hello World!</div>
                }
                {
                    <SortingUnitPlotGrid
                        sorting={sorting}
                        selection={selection}
                        selectionDispatch={selectionDispatch}
                        unitComponent={unitComponent}
                    />
                }

            </Splitter>
        </div>
    );
}

export default sizeMe()(AverageWaveformsView)