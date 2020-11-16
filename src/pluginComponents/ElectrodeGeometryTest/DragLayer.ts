import { Brush, CanvasPainter } from '../../components/jscommon/CanvasWidget/CanvasPainter'
import { CanvasWidgetLayer, DragHandler } from '../../components/jscommon/CanvasWidget/CanvasWidgetLayer'
import { RectangularRegion, rectangularRegionsIntersect, Vec2 } from '../../components/jscommon/CanvasWidget/Geometry'
import { Electrode, ElectrodeLayerProps, setCanvasFromProps } from './ElectrodeGeometry'

// This could just as well have gone in the ElectrodeGeometry.tsx file since it touches on the data that's 'owned' by the
// ElectrodeGeometry component; however, the functions in this file are the only things consuming it right now.
// A different implementation might do things differently.
const getElectrodeBoundingRect = (e: Electrode, r: number, fill: boolean = false): RectangularRegion => {
    const myRadius = fill ? r - 1 : r
    return {
        xmin: e.x - myRadius,
        ymin: e.y - myRadius,
        xmax: e.x + myRadius,
        ymax: e.y + myRadius
    }
}

export interface DragLayerState {
    dragRegion: RectangularRegion | null
    electrodeBoundingBoxes: {label: string, x: number, y: number, br: RectangularRegion}[]
    selectedElectrodes: Electrode[]
    draggedElectrodes: Electrode[]
}
export const setDragLayerStateFromProps = (layer: CanvasWidgetLayer<ElectrodeLayerProps, DragLayerState>, layerProps: ElectrodeLayerProps) => {
    setCanvasFromProps(layer, layerProps)
    let layerState = layer.getState()
    layerState = {
        ...layerState,
        electrodeBoundingBoxes: layerState.electrodeBoundingBoxes || [],
        selectedElectrodes: layerState.selectedElectrodes || [], // Could move this up to the Props
        draggedElectrodes: layerState.draggedElectrodes || []
    }
    const { electrodes, electrodeRadius } = layerProps
    const rects = electrodes.map((e: Electrode) => {return {...e, br: getElectrodeBoundingRect(e, electrodeRadius)}})
    layer.setState({...layerState, electrodeBoundingBoxes: rects})
}
export const paintDragLayer = (painter: CanvasPainter, props: ElectrodeLayerProps, state: DragLayerState) => {
    painter.wipe()
    if (!state.dragRegion && state.selectedElectrodes?.length === 0 && state.draggedElectrodes.length === 0) return;
    const regionBrush: Brush = {color: 'rgba(127, 127, 127, 0.5)'}
    const selectedElectrodeBrush: Brush = {color: 'rgb(0, 0, 192)'}
    const draggedElectrodeBrush: Brush = {color: 'rgb(192, 192, 255)'}

    state.selectedElectrodes.forEach(e => {
        painter.fillEllipse(getElectrodeBoundingRect(e, props.electrodeRadius, true), selectedElectrodeBrush)
    })
    state.draggedElectrodes.forEach(e => {
        painter.fillEllipse(getElectrodeBoundingRect(e, props.electrodeRadius, true), draggedElectrodeBrush)
    })
    state.dragRegion && painter.fillRect(state.dragRegion, regionBrush)
}
export const updateDragRegion: DragHandler = (layer: CanvasWidgetLayer<ElectrodeLayerProps, DragLayerState>, dragRect: RectangularRegion, released: boolean, anchor?: Vec2, position?: Vec2) => {
    const { electrodeBoundingBoxes } = layer.getState()
    const hits = electrodeBoundingBoxes.filter((r: any) => rectangularRegionsIntersect(r.br, dragRect))
    if (released) {
        layer.setState({...layer.getState(), dragRegion: null, draggedElectrodes: [], selectedElectrodes: hits})
    } else {
        layer.setState({...layer.getState(), dragRegion: dragRect, draggedElectrodes: hits})
    }
    layer.scheduleRepaint()
}
