import { funcToTransform } from '../../CanvasWidget';
import { CanvasPainter } from '../../CanvasWidget/CanvasPainter';
import { CanvasWidgetLayer } from "../../CanvasWidget/CanvasWidgetLayer";
import { LayerProps } from './AverageWaveformWidget';
import setupElectrodes, { ElectrodeBox } from './setupElectrodes';

export type WaveformColors = {
    base: string
}
const defaultWaveformColors: WaveformColors = {
    base: 'black'
}
type LayerState = {
    electrodeBoxes: ElectrodeBox[]
}
const initialLayerState = {
    electrodeBoxes: []
}

export const createWaveformLayer = () => {
    const onPaint = (painter: CanvasPainter, props: LayerProps, state: LayerState) => {
        const { waveform } = props
        const opts = props.waveformOpts
        const colors = opts.colors || defaultWaveformColors
        const maxAbs = Math.max(...waveform.map(w => Math.max(...w.map(x => Math.abs(x)))))
        painter.wipe()
        const yScaleFactor = 1 / maxAbs
        for (let i = 0; i < state.electrodeBoxes.length; i++) {
            const e = state.electrodeBoxes[i]
            const painter2 = painter.transform(e.transform).transform(funcToTransform(p => {
                return [p[0] / waveform[i].length, 0.5 - (p[1] / 2) * yScaleFactor]
            }))
            const path = painter2.createPainterPath()
            for (let j = 0; j < waveform[i].length; j ++) {
                path.lineTo(j, waveform[i][j])
            }
            painter2.drawPath(path, {color: colors.base, width: opts.waveformWidth})
        }
    }
    const onPropsChange = (layer: CanvasWidgetLayer<LayerProps, LayerState>, props: LayerProps) => {
        const state = layer.getState()
        const { width, height, electrodeLocations, electrodeIds } = props
        const { electrodeBoxes, transform, radius, pixelRadius } = setupElectrodes({width, height, electrodeLocations, electrodeIds})
        layer.setTransformMatrix(transform)
        layer.setState({electrodeBoxes})
        layer.scheduleRepaint()
    }
    return new CanvasWidgetLayer<LayerProps, LayerState>(
        onPaint,
        onPropsChange,
        initialLayerState
    )
}