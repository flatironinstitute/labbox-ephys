import { norm } from 'mathjs'
import React from "react"
import { CanvasPainter } from '../../CanvasWidget/CanvasPainter'
import { CanvasWidgetLayer, ClickEvent, ClickEventType, DiscreteMouseEventHandler, DragEvent, DragHandler, useCanvasWidgetLayer, useCanvasWidgetLayers } from "../../CanvasWidget/CanvasWidgetLayer"
import CanvasWidget from '../../CanvasWidget/CanvasWidget'
import { getBoundingBoxForEllipse, getHeight, getWidth, pointIsInEllipse, RectangularRegion, rectangularRegionsIntersect, transformDistance, Vec2 } from '../../CanvasWidget/Geometry'
import { funcToTransform } from '../TimeWidgetNew/mainLayer'


// - allows drag and click selection of electrodes
// - highlights mouseover of electrodes

enum Color {
    BASE = 'rgb(0, 0, 255)',
    SELECTED = 'rgb(196, 196, 128)',
    HOVER = 'rgb(128, 128, 255)',
    SELECTEDHOVER = 'rgb(200, 200, 196)',
    DRAGGED = 'rgb(0, 0, 196)',
    DRAGGEDSELECTED = 'rgb(180, 180, 150)',
    DRAGRECT = 'rgba(196, 196, 196, 0.5)'
}
enum TextColor {
    LIGHT = 'rgb(228, 228, 228)',
    DARK = 'rgb(32, 32, 32)'
}

export type Electrode = {
    label: string,
    x: number,
    y: number
}

// Okay, so after some hoop-jumping, we've learned the RecordingInfo has:
// - sampling frequency (number), - channel_ids (list of number),
// - channel_groups (list of number), - geom (list of Vec2),
// - num_frames (number), - is_local (boolean).

interface WidgetProps {
    electrodes: Electrode[]
    selectedElectrodeIds: number[]
    onSelectedElectrodeIdsChanged: (x: number[]) => void
    width: number
    height: number
}

interface ElectrodeBoundingBox extends Electrode {
    id: number,
    br: RectangularRegion
}

interface ElectrodeLayerProps extends WidgetProps {
    // width and height will be used for the underlying Canvas dimensions.
    // These are expected to take up 100% of the Widget area.
    height: number
}

interface ElectrodeLayerState {
    electrodeBoundingBoxes: ElectrodeBoundingBox[]
    dragRegion: RectangularRegion | null
    draggedElectrodeIds: number[]
    hoveredElectrodeId: number | null
    radius: number
    pixelRadius: number
    lastProps: ElectrodeLayerProps
}

const initialElectrodeLayerState: ElectrodeLayerState = {
    electrodeBoundingBoxes: [],
    dragRegion: null,
    draggedElectrodeIds: [],
    hoveredElectrodeId: null,
    radius: 0,
    pixelRadius: 0,
    lastProps: {
        electrodes: [],
        selectedElectrodeIds: [],
        onSelectedElectrodeIdsChanged: () => {},
        width: 0,
        height: 0
    }
}

const computeRadiusCache = new Map<string, number>()
const computeRadius = (electrodes: Electrode[]): number => {
    const key = JSON.stringify(electrodes)
    const val = computeRadiusCache.get(key)
    if (val !== undefined) {
        return val
    }
    // how big should each electrode dot be? Really depends on how close
    // the dots are to each other. Let's find the closest pair of dots and
    // set the radius to 40% of the distance between them.
    let leastNorm = Number.MAX_VALUE
    electrodes.forEach((point) => {
        electrodes.forEach((otherPoint) => {
            const dist = norm([point.x - otherPoint.x, point.y - otherPoint.y])
            if (dist === 0) return
            leastNorm = Math.min(leastNorm, dist as number)
        })
    })
    // (might set a hard cap, but remember these numbers are in electrode-space coordinates)
    const radius = 0.4 * leastNorm
    computeRadiusCache.set(key, radius)
    return radius
}

const getElectrodesBoundingBox = (electrodes: Electrode[], radius: number): RectangularRegion => {
    return {
        xmin: Math.min(...electrodes.map(e => (e.x))) - radius,
        xmax: Math.max(...electrodes.map(e => (e.x))) + radius,
        ymin: Math.min(...electrodes.map(e => (e.y))) - radius,
        ymax: Math.max(...electrodes.map(e => (e.y))) + radius
    }
}

const onUpdateLayerProps = (layer: CanvasWidgetLayer<ElectrodeLayerProps, ElectrodeLayerState>, layerProps: ElectrodeLayerProps) => {
    const state = layer.getState()
    const { width, height, electrodes } = layerProps
    const W = width - 10 * 2
    const H = height - 10 * 2
    const canvasAspect = W / H

    const radius = computeRadius(electrodes)
    const boundingBox = getElectrodesBoundingBox(electrodes, radius)
    const boxAspect = getWidth(boundingBox) / getHeight(boundingBox)

    let scaleFactor: number
    if (boxAspect > canvasAspect) {
        // we are constrained in width
        scaleFactor = W / getWidth(boundingBox)
    }
    else {
        // we are constrained in height
        scaleFactor = H / getHeight(boundingBox)
    }

    const xMargin = (width - getWidth(boundingBox) * scaleFactor) / 2
    const yMargin = (height - getHeight(boundingBox) * scaleFactor) / 2

    const transform = funcToTransform((p: Vec2): Vec2 => {
        const x = xMargin + (p[0] - boundingBox.xmin) * scaleFactor
        const y = yMargin + (p[1] - boundingBox.ymin) * scaleFactor
        return [x, y]
    })

    const electrodeBoxes = electrodes.map((e) => { 
        const x = e.x
        const y = e.y
        return { label: e.label, id: parseInt(e.label), x: x, y: y, br: getBoundingBoxForEllipse([x, y], radius, radius)}}
    )

    layer.setTransformMatrix(transform)
    const pixelRadius = transformDistance(transform, [radius, 0])[0]
    layer.setState({...state, electrodeBoundingBoxes: electrodeBoxes, radius: radius, pixelRadius: pixelRadius, lastProps: layerProps})
    // layer.repaintImmediate()
    layer.scheduleRepaint()
}

const paintElectrodeGeometryLayer = (painter: CanvasPainter, props: ElectrodeLayerProps, state: ElectrodeLayerState) => {
    painter.wipe()
    const useLabels = state.pixelRadius > 5
    for (let e of state.electrodeBoundingBoxes) {
        const selected = props.selectedElectrodeIds?.includes(e.id) || false
        const hovered = state.hoveredElectrodeId === e.id
        const dragged = state.draggedElectrodeIds?.includes(e.id) || false
        const color = selected 
                        ? dragged
                            ? Color.DRAGGEDSELECTED
                            : hovered
                                ? Color.SELECTEDHOVER
                                : Color.SELECTED
                        : dragged
                            ? Color.DRAGGED
                            : hovered
                                ? Color.HOVER
                                : Color.BASE
        painter.fillEllipse(e.br, {color: color})
        if (useLabels) {
            const fontColor = ([Color.SELECTED, Color.DRAGGEDSELECTED, Color.HOVER, Color.SELECTEDHOVER].includes(color)) ? TextColor.DARK : TextColor.LIGHT
            painter.drawText(e.br, 
                {Horizontal: 'AlignCenter', Vertical: 'AlignCenter'}, 
                {pixelSize: state.pixelRadius, family: 'Arial'},
                {color: fontColor}, {color: fontColor},
                e.label)
        }
    }

    state.dragRegion && painter.fillRect(state.dragRegion, {color: Color.DRAGRECT})
}

const handleDragSelect: DragHandler = (layer: CanvasWidgetLayer<ElectrodeLayerProps, ElectrodeLayerState>, drag: DragEvent) => {
    const state = layer.getState()
    if (state === null) return // state not set; can't happen but keeps linter happy
    const hits = state.electrodeBoundingBoxes.filter((r) => rectangularRegionsIntersect(r.br, drag.dragRect)) ?? []
    if (drag.released) {
        const currentSelected = drag.shift ? layer.getProps()?.selectedElectrodeIds ?? [] : []
        layer.getProps()?.onSelectedElectrodeIdsChanged([...currentSelected, ...hits.map(r => r.id)])
        layer.setState({...state, dragRegion: null, draggedElectrodeIds: []})
    } else {
        layer.setState({...state, dragRegion: drag.dragRect, draggedElectrodeIds: hits.map(r => r.id)})
    }
    layer.scheduleRepaint()
}

const handleClick: DiscreteMouseEventHandler = (event: ClickEvent, layer: CanvasWidgetLayer<ElectrodeLayerProps, ElectrodeLayerState>) => {
    if (event.type !== ClickEventType.Release) return
    const state = layer.getState()
    if (state === null) return
    const hitIds = state.electrodeBoundingBoxes.filter((r) => pointIsInEllipse(event.point, [r.x, r.y], state.radius)).map(r => r.id)
    // handle clicks that weren't on an electrode
    if (hitIds.length === 0) {
        if (!(event.modifiers.ctrl || event.modifiers.shift || state.dragRegion)) {
            // simple-click that doesn't select anything should deselect everything. Shift- or Ctrl-clicks on empty space do nothing.
            layer.getProps()?.onSelectedElectrodeIdsChanged([])
        }
        return
    }
    // Our definition of radius precludes any two electrodes from overlapping, so hitIds should have 0 or 1 elements.
    // Since we've already handled the case where it's 0, now it must be 1.
    const hitId = hitIds[0]
    
    const currentSelection = layer.getProps()?.selectedElectrodeIds || []
    const newSelection = event.modifiers.ctrl  // ctrl-click: toggle state of clicked item
                            ? currentSelection.includes(hitId)
                                ? currentSelection.filter(id => id !== hitId)
                                : [...currentSelection, hitId]
                            : event.modifiers.shift
                                ? [...currentSelection, hitId] // shift-click: add selected item unconditionally
                                : [hitId] // simple click: clear all selections except clicked item
    layer.getProps()?.onSelectedElectrodeIdsChanged(newSelection)
    layer.scheduleRepaint()
}

const handleHover: DiscreteMouseEventHandler = (event: ClickEvent, layer: CanvasWidgetLayer<ElectrodeLayerProps, ElectrodeLayerState>) => {
    if (event.type !== ClickEventType.Move) return
    const state = layer.getState()
    if (state === null) return
    const hoveredIds = state.electrodeBoundingBoxes.filter((r) => pointIsInEllipse(event.point, [r.x, r.y], state.radius)).map(r => r.id)
    layer.setState({...state, hoveredElectrodeId: hoveredIds.length === 0 ? null : hoveredIds[0]})
    layer.scheduleRepaint()
}

const createLayer = () => {
    return new CanvasWidgetLayer<ElectrodeLayerProps, ElectrodeLayerState>(
        paintElectrodeGeometryLayer,
        onUpdateLayerProps,
        initialElectrodeLayerState,
        {
            dragHandlers: [handleDragSelect],
            discreteMouseEventHandlers: [handleClick, handleHover]
        }
    )
}

type LayerArray = Array<CanvasWidgetLayer<ElectrodeLayerProps, ElectrodeLayerState>> 
const ElectrodeGeometryCanvas = (props: ElectrodeLayerProps) => {
    const layer = useCanvasWidgetLayer(createLayer)
    const layers = useCanvasWidgetLayers([layer])

    return (
        <CanvasWidget<ElectrodeLayerProps>
            key='electrodeGeometryCanvas'
            layers={layers || []}
            layerProps={props}
        />
    )
}


// Widget proper: just a Sizeme wrapper.
const ElectrodeGeometryWidget = (props: WidgetProps) => {
    return (
        <ElectrodeGeometryCanvas 
            {...props}
        />
    )
}

export default ElectrodeGeometryWidget