import { norm } from 'mathjs'
import React, { useEffect, useState } from "react"
import { SizeMe } from "react-sizeme"
import { CanvasPainter } from '../../components/jscommon/CanvasWidget/CanvasPainter'
import { CanvasWidgetLayer, ClickEvent, ClickEventType, DiscreteMouseEventHandler, DragEvent, DragHandler } from "../jscommon/CanvasWidget/CanvasWidgetLayer"
import CanvasWidget from '../jscommon/CanvasWidget/CanvasWidgetNew'
import { getBoundingBoxForEllipse, getHeight, getUpdatedTransformationMatrix, getWidth, pointIsInEllipse, RectangularRegion, rectangularRegionsIntersect, transformDistance } from '../jscommon/CanvasWidget/Geometry'


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
    lastDragUpdate: DOMHighResTimeStamp | null
    lastProps: ElectrodeLayerProps
}

const initialElectrodeLayerState: ElectrodeLayerState = {
    electrodeBoundingBoxes: [],
    dragRegion: null,
    draggedElectrodeIds: [],
    hoveredElectrodeId: null,
    radius: 0,
    pixelRadius: 0,
    lastDragUpdate: null,
    lastProps: {
        electrodes: [],
        selectedElectrodeIds: [],
        onSelectedElectrodeIdsChanged: () => {},
        width: 0,
        height: 0
    }
}

const fitElectrodesToCanvas = (canvasAspect: number, electrodes: Electrode[]) => {
    const electrodeXs = electrodes.map((point) => point.x)
    const electrodeYs = electrodes.map((point) => point.y)

    const baseElectrodeBox = {
        xmin: Math.min(...electrodeXs),
        xmax: Math.max(...electrodeXs),
        ymin: Math.min(...electrodeYs),
        ymax: Math.max(...electrodeYs)
    }
    // handle transposition: If the electrode box is portrait and the canvas is landscape (or vice versa),
    // reflect the electrode coordinates across x = y to flip the orientation and make it fit better.
    // (TODO: Check that this is really what we want)
    const electrodeBoxAspect = getWidth(baseElectrodeBox) / getHeight(baseElectrodeBox)
    const radius = computeRadius(electrodes)
    // set margin to edge of bounding box to equal the same as the least distance b/w any pair of electrodes
    // Note: Might want to set a cap on that, if we wind up with very sparse probes (unlikely, but possible)
    const margin = radius / 0.4
    
    // If aspect ratio of the canvas and the electrode bounding box don't match, then transpose the electrodes
    // so they fit better in the canvas (i.e. don't draw a portrait probe in a landscape canvas.)
    // We achieve this by reflecting over x = y, which flips the relative locations but needs no computation.
    // If a real rotation is preferable, we can implement that here.
    const transpose = ((canvasAspect < 1) !== (electrodeBoxAspect < 1))
    // add the margin. During the process, transpose x and y dimensions if we're transposing the electrode locations.
    const realizedElectrodeBox = {
        xmin: (transpose ? baseElectrodeBox.ymin : baseElectrodeBox.xmin) - margin,
        xmax: (transpose ? baseElectrodeBox.ymax : baseElectrodeBox.xmax) + margin,
        ymin: (transpose ? baseElectrodeBox.xmin : baseElectrodeBox.ymin) - margin,
        ymax: (transpose ? baseElectrodeBox.xmax : baseElectrodeBox.ymax) + margin
    }

    const realizedElectrodes = electrodes.map((e) => { 
        const x = transpose ? e.y : e.x
        const y = transpose ? e.x : e.y
        // TODO: Is the assumption that labels will be numeric correct?
        return { label: e.label, id: parseInt(e.label), x: x, y: y, br: getBoundingBoxForEllipse([x, y], radius, radius)}}
    )
    return {coordinates: realizedElectrodeBox, radius: radius, electrodeBoxes: realizedElectrodes }
}

const computeRadius = (electrodes: Electrode[]): number => {
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
    return radius
}

const serializeElectrodes = (e: Electrode[]): string => {
    const sortedList = e.sort((a, b) => (a.label > b.label) ? 1 : (a.label === b.label) ? (a.x > b.x) ? 1 : -1 : -1)
    return sortedList.map((e) => `${e.label}-${e.x}-${e.y}`).join(':')
}

const propSetsDiffer = (a: ElectrodeLayerProps, b: ElectrodeLayerProps): boolean => {
    if (!a || !b) return true // definitely need to recompute if one of the prop sets is undefined!
    if (a.height !== b.height || a.width !== b.width) return true
    if (a.electrodes.length !== b.electrodes.length) return true
    return (serializeElectrodes(a.electrodes) !== serializeElectrodes(b.electrodes))
}

const onUpdateLayerProps = (layer: CanvasWidgetLayer<ElectrodeLayerProps, ElectrodeLayerState>, layerProps: ElectrodeLayerProps) => {
    if (!layerProps.width || ! layerProps.height) { // This happens when we're called before the canvas element exists & has dimensions.
        layer.setState({
            electrodeBoundingBoxes: [],
            draggedElectrodeIds: [],
            radius: -1,
            dragRegion: null,
            hoveredElectrodeId: null,
            pixelRadius: -1,
            lastDragUpdate: null,
            lastProps: layerProps
        })
        return
    }
    // check if there were any actual electrode changes--if not we can skip this whole business
    const oldState = layer.getState() || {} as ElectrodeLayerState
    // if (!propSetsDiffer(oldState.lastProps, layerProps)) return
    layer.setBasePixelTransformationMatrix()
    const canvasAspect = layerProps.width/ layerProps.height
    const { coordinates, radius, electrodeBoxes } = fitElectrodesToCanvas(canvasAspect, layerProps.electrodes)
    const electrodeRectAspect = getWidth(coordinates)/getHeight(coordinates)
    // TODO: This fitting-region-into-canvas logic should go in the CanvasLayer as we're likely to have use of it fairly often!!
    // We'll need to cut off part of the canvas to maintain the electrode box's aspect ratio.
    // Let electrode bounding box dimensions be w and h, and canvas's dimensions be x and y.
    // Then canvas aspect is x/y and electrode aspect is w/h.
    // If x/y > w/h, then x > wy/h, so setting xmax to wy/h will not delete any data.
    // If x/y < w/h otoh, then xh/w < y, so we can set ymax to xh/w and not push any data out of frame.

    const canvasCoordRange = layer.getCoordRange()
    // x/y > w/h --> x > y*w/h, so cut x off at y*w/h
    const xmax = (canvasAspect > electrodeRectAspect) ? canvasCoordRange.ymax * electrodeRectAspect : canvasCoordRange.xmax
    // x/y < w/h --> xh/w < y so cut y off at xh/w
    const ymax = (canvasAspect > electrodeRectAspect) ? canvasCoordRange.ymax : canvasCoordRange.xmax / electrodeRectAspect
    // Now we need to center that in the frame or the layout will be insufferable
    const xmargin =  (getWidth(canvasCoordRange) - xmax) / 2
    const ymargin = (getHeight(canvasCoordRange) - ymax) / 2
    const window = {
        xmin: canvasCoordRange.xmin + xmargin,
        xmax: canvasCoordRange.xmax - xmargin,
        ymin: canvasCoordRange.ymin + ymargin,
        ymax: canvasCoordRange.ymax - ymargin
    }

    // const window = (canvasAspect > electrodeRectAspect)
    //     ? {...canvasCoordRange, xmax: canvasCoordRange.ymax * electrodeRectAspect } 
    //     : {...canvasCoordRange, ymax: canvasCoordRange.xmax / electrodeRectAspect } 
    const newTransform = getUpdatedTransformationMatrix(coordinates, window, layer.getTransformMatrix())
    layer.setTransformMatrix(newTransform)
    layer.setCoordRange(coordinates)
    const pixelRadius = transformDistance(layer.getTransformMatrix(), [radius, 0])[0]
    layer.setState({...oldState, electrodeBoundingBoxes: electrodeBoxes, radius: radius, pixelRadius: pixelRadius, lastProps: layerProps})
    layer.repaintImmediate()
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
    if (state.lastDragUpdate && performance.now() - state.lastDragUpdate < 50) return // rate-limit the drag updates to improve performance
    const thisUpdate = performance.now()
    const hits = state.electrodeBoundingBoxes.filter((r) => rectangularRegionsIntersect(r.br, drag.dragRect)) ?? []
    if (drag.released) {
        const currentSelected = drag.shift ? layer.getProps()?.selectedElectrodeIds ?? [] : []
        layer.getProps()?.onSelectedElectrodeIdsChanged([...currentSelected, ...hits.map(r => r.id)])
        layer.setState({...state, dragRegion: null, draggedElectrodeIds: [], lastDragUpdate: thisUpdate})
    } else {
        layer.setState({...state, dragRegion: drag.dragRect, draggedElectrodeIds: hits.map(r => r.id), lastDragUpdate: thisUpdate})
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

type LayerArray = Array<CanvasWidgetLayer<ElectrodeLayerProps, ElectrodeLayerState>> 
const ElectrodeGeometryCanvas = (props: ElectrodeLayerProps) => {
    const [layers, setLayers] = useState<LayerArray>([])
    useEffect(() => {
        if (!layers || layers.length === 0) {
            const layer = new CanvasWidgetLayer<ElectrodeLayerProps, ElectrodeLayerState>(
                paintElectrodeGeometryLayer,
                onUpdateLayerProps,
                initialElectrodeLayerState,
                {
                    dragHandlers: [handleDragSelect],
                    discreteMouseEventHandlers: [handleClick, handleHover]
                })
            setLayers([layer])
        }
    }, [layers, setLayers])
    layers.forEach((l) => l.updateProps(props))

    return (
        <CanvasWidget<ElectrodeLayerProps>
            key='electrodeGeometryCanvas'
            layers={layers}
            layerProps={props}
        />
    )
}


// Widget proper: just a Sizeme wrapper.
const ElectrodeGeometryWidget = (props: WidgetProps) => {
    return (
        <SizeMe monitorHeight>
            {({ size }) =>
                <React.Fragment>
                <div>LOOK HERE</div>
                <div style={{width: "100%", height: "40%"}}>
                    <ElectrodeGeometryCanvas 
                        {...props}
                        width={size.width || 5}
                        height={Math.min(size.height || 5, 1800)} // maxHeight hard-coded to 1800
                    />
                </div>
                <div>BELOW CANVAS</div>
                </React.Fragment>
            }
        </SizeMe>
    )
}

export default ElectrodeGeometryWidget