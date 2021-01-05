import React, { FunctionComponent, useCallback, useState } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import WaveformWidget from '../../averagewaveforms/AverageWaveformsView/WaveformWidget';
import { SortingSelection, SortingSelectionDispatch } from '../../extensionInterface';
import { Snippet } from './SnippetsWidgetBox';

type Props = {
    snippet: Snippet
    noiseLevel: number
    samplingFrequency: number
    electrodeIds: number[]
    electrodeLocations: number[][]
    selection: SortingSelection
    selectionDispatch: SortingSelectionDispatch
    width: number
    height: number
}

const SnippetBox: FunctionComponent<Props> = ({ snippet, noiseLevel, samplingFrequency, electrodeIds, electrodeLocations, selection, selectionDispatch, width, height }) => {
    const [hasBeenVisible, setHasBeenVisible] = useState(false)
    const handleVisibilityChange = useCallback((isVisible: boolean) => {
        if ((isVisible) && (!hasBeenVisible)) setHasBeenVisible(true)
    }, [hasBeenVisible, setHasBeenVisible])
    return (
        <VisibilitySensor onChange={handleVisibilityChange} partialVisibility={true}>
            {
                hasBeenVisible ? (
                    <WaveformWidget
                        waveform={snippet.waveform}
                        {...{selection, selectionDispatch, noiseLevel, samplingFrequency, electrodeIds, electrodeLocations, width, height}}
                    />
                ) : (
                    <div style={{position: 'absolute', width, height}} />
                )
            }
        </VisibilitySensor>
    )
}

export default SnippetBox