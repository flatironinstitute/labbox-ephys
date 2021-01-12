import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import sizeMe, { SizeMeProps } from 'react-sizeme';
import SortingUnitPlotGrid from '../../common/SortingUnitPlotGrid';
import Splitter from '../../common/Splitter';
import { ActionItem, DividerItem } from '../../common/Toolbars';
import { SortingViewProps } from "../../extensionInterface";
import AverageWaveformsToolbar from './AverageWaveformsToolbar';
import AverageWaveformView2 from './AverageWaveformView2';

export type AverageWaveformAction = ActionItem | DividerItem


const TOOLBAR_INITIAL_WIDTH = 75

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
    const [scalingActions, setScalingActions] = useState<AverageWaveformAction[] | null>(null)

    const width = props.size.width;
    const height = 650 // hard-coded as per TimeseriesForRecordingView.tsx

    useEffect(() => {
        if (scalingActions === null) {
            const actions: AverageWaveformAction[] = [
                {
                    type: 'button',
                    callback: () => null,
                    title: 'Scale amplitude up [up arrow]',
                    icon: <FaArrowUp />,
                    keyCode: 38
                },
                {
                    type: 'button',
                    callback: () => null,
                    title: 'Scale amplitude down [down arrow]',
                    icon: <FaArrowDown />,
                    keyCode: 40
                }
            ]
            setScalingActions(actions)
        }
    }, [scalingActions, setScalingActions])

    return width ? (
        <div>
            <Splitter
                width={width}
                height={height}
                initialPosition={TOOLBAR_INITIAL_WIDTH}
            >
                {
                    <AverageWaveformsToolbar
                        width={TOOLBAR_INITIAL_WIDTH}
                        height={height}
                        customActions={scalingActions}
                    />
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
    )
    : (<div>No width</div>);
}

export default sizeMe()(AverageWaveformsView)