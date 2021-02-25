import React, { FunctionComponent } from 'react';
import CanvasWidget from '../../common/CanvasWidget';
import { useLayer, useLayers } from '../../common/CanvasWidget/CanvasWidgetLayer';
import { ActionItem, DividerItem } from '../../common/Toolbars';
import { RecordingSelection, RecordingSelectionDispatch } from "../../pluginInterface";
import { createElectrodesLayer, ElectrodeColors } from './electrodesLayer';
import { createWaveformLayer, WaveformColors } from './waveformLayer';

export type Props = {
    waveform?: number[][]
    layoutMode: 'geom' | 'vertical'
    noiseLevel: number
    electrodeIds: number[]
    electrodeLocations: number[][]
    samplingFrequency: number
    width: number
    height: number
    selection: RecordingSelection
    selectionDispatch: RecordingSelectionDispatch
    electrodeOpts: ElectrodeOpts
    customActions?: (ActionItem | DividerItem)[]
}

export type ElectrodeOpts = {
    colors?: ElectrodeColors
    showLabels?: boolean
    disableSelection?: boolean
    maxElectrodePixelRadius?: number
}

export type LayerProps = Props & {
    layoutMode: 'geom' | 'vertical'
    waveformOpts: {
        colors?: WaveformColors
        waveformWidth: number
    }
}

export type ElectrodeLayerProps = Props

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

const defaultElectrodeOpts = {
    colors: electrodeColors,
    showLabels: false
}

const defaultWaveformOpts = {
    colors: waveformColors,
    waveformWidth: 2
}

const WaveformWidget: FunctionComponent<Props> = (props) => {
    const layerProps: LayerProps = {
        ...props,
        electrodeOpts: {...defaultElectrodeOpts, ...props.electrodeOpts},
        waveformOpts: defaultWaveformOpts,
    }
    const electrodeLayerProps: ElectrodeLayerProps = {
        ...props,
        electrodeOpts: {...defaultElectrodeOpts, ...props.electrodeOpts},
    }
    const electrodesLayer = useLayer(createElectrodesLayer, electrodeLayerProps)
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