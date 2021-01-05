import React, { FunctionComponent } from 'react';
import CanvasWidget from '../../common/CanvasWidget';
import { useLayer, useLayers } from '../../common/CanvasWidget/CanvasWidgetLayer';
import { RecordingSelection, RecordingSelectionDispatch } from '../../extensionInterface';
import { createElectrodesLayer, ElectrodeColors } from './electrodesLayer';
import { createWaveformLayer, WaveformColors } from './waveformLayer';

export type Props = {
    waveform: number[][]
    noiseLevel: number
    electrodeIds: number[],
    electrodeLocations: number[][],
    samplingFrequency: number,
    width: number
    height: number
    selection: RecordingSelection
    selectionDispatch: RecordingSelectionDispatch
}

export type LayerProps = Props & {
    electrodeOpts: {
        colors?: ElectrodeColors
        showLabels?: boolean
    },
    waveformOpts: {
        colors?: WaveformColors,
        waveformWidth: number
    }
}

const electrodeColors: ElectrodeColors = {
    border: 'rgb(120, 100, 120)',
    base: 'rgb(255, 255, 255)',
    selected: 'rgb(196, 196, 128)',
    hover: 'rgb(128, 128, 255)',
    selectedHover: 'rgb(200, 200, 196)',
    dragged: 'rgb(0, 0, 196)',
    draggedSelected: 'rgb(180, 180, 150)',
    dragRect: 'rgba(196, 196, 196, 0.5)',
    textLight: 'rgb(32, 32, 32)',
    textDark: 'rgb(228, 228, 228)'
}
const waveformColors: WaveformColors = {
    base: 'black'
}

const electrodeOpts = {
    colors: electrodeColors,
    showLabels: false
}

const waveformOpts = {
    colors: waveformColors,
    waveformWidth: 2
}

const WaveformWidget: FunctionComponent<Props> = (props) => {
    const layerProps = {
        ...props,
        electrodeOpts,
        waveformOpts
    }
    const electrodesLayer = useLayer(createElectrodesLayer, layerProps)
    const waveformLayer = useLayer(createWaveformLayer, layerProps)
    const layers = useLayers([electrodesLayer, waveformLayer])
    return (
        <CanvasWidget
            layers={layers}
            {...{width: props.width, height: props.height}}
        />
    )
}

export default WaveformWidget