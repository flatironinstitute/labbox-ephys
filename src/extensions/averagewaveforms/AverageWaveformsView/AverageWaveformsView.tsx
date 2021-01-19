import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import sizeMe, { SizeMeProps } from 'react-sizeme';
import SortingUnitPlotGrid from '../../common/SortingUnitPlotGrid';
import Splitter from '../../common/Splitter';
import { ActionItem, DividerItem } from '../../common/Toolbars';
import { SortingViewProps } from "../../extensionInterface";
import AverageWaveformsToolbar from './AverageWaveformsToolbar';
import AverageWaveformView from './AverageWaveformView';

export type AverageWaveformAction = ActionItem | DividerItem


const TOOLBAR_INITIAL_WIDTH = 55

const AverageWaveformsView: FunctionComponent<SortingViewProps & SizeMeProps> = (props) => {
    const {recording, sorting, selection, selectionDispatch} = props
    const boxHeight = 250
    const boxWidth = 180
    const noiseLevel = (recording.recordingInfo || {}).noise_level || 1  // fix this
    const [scalingActions, setScalingActions] = useState<AverageWaveformAction[] | null>(null)
    const unitComponent = useMemo(() => (unitId: number) => (
        <AverageWaveformView
            {...{sorting, recording, unitId, selection, selectionDispatch}}
            width={boxWidth}
            height={boxHeight}
            noiseLevel={noiseLevel}
            customActions={scalingActions || []}
        />
    ), [sorting, recording, selection, selectionDispatch, noiseLevel, scalingActions])

    const width = props.size.width;
    const height = 650 // hard-coded as per TimeseriesForRecordingView.tsx

    const _handleScaleAmplitudeUp = useCallback(() => {
        selectionDispatch({type: 'ScaleAmpScaleFactor', multiplier: 1.15})
    }, [selectionDispatch])
    const _handleScaleAmplitudeDown = useCallback(() => {
        selectionDispatch({type: 'ScaleAmpScaleFactor', multiplier: 1 / 1.15})
    }, [selectionDispatch])

    useEffect(() => {
        const actions: AverageWaveformAction[] = [
            {
                type: 'button',
                callback: _handleScaleAmplitudeUp,
                title: 'Scale amplitude up [up arrow]',
                icon: <FaArrowUp />,
                keyCode: 38
            },
            {
                type: 'button',
                callback: _handleScaleAmplitudeDown,
                title: 'Scale amplitude down [down arrow]',
                icon: <FaArrowDown />,
                keyCode: 40
            }
        ]
        setScalingActions(actions)
    }, [_handleScaleAmplitudeUp, _handleScaleAmplitudeDown])

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