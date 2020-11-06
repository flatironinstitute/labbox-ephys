import React, { useCallback, useEffect, useRef, useState } from 'react'
import { CanvasPainter, isTextAlignment } from '../../components/jscommon/CanvasWidget/CanvasPainter'
import { CanvasWidgetLayer } from '../../components/jscommon/CanvasWidget/CanvasWidgetLayer'
import CanvasWidget from '../../components/jscommon/CanvasWidget/CanvasWidgetNew'
import { Vec2 } from '../../components/jscommon/CanvasWidget/Geometry'

// TODO: FIXME

interface ElectrodePlotData {
    label: string | null
    position: {x: number, y: number}
    waveform?: number[]
}

interface Props {
    width: number
    height: number
    data: {
        waveformYScaleFactor: number
        electrodes: ElectrodePlotData[]
    }
    plotElectrodes: boolean
}

interface Rect {
    x: number
    y: number
    w: number
    h: number
}

interface ExtendedProps extends Props {
    electrodeRects: Rect[]
    hoveredElectrodeIndex: number | null
    selectedElectrodeIndices: {[key: number]: true}
}

const determineSpacingFromPositions = (positions: {x: number, y: number}[]): number => {
    if (positions.length <= 1) return 0
    const minDists = positions.map((p) => {
        const dists = positions.map(p2 => (Math.max(Math.abs(p.x - p2.x), Math.abs(p.y - p2.y)))).filter(d => (d > 0))
        return (dists.length > 0) ? Math.min(...dists.filter(d => (d > 0))) : 1
    })
    return Math.min(...minDists)
}

const computeElectrodeRects = (props: Props): Rect[] => {
    const positions = props.data.electrodes.map(e => (e.position))
    const spacing = determineSpacingFromPositions(positions)
    let xmin = Math.min(...positions.map(p => (p.x)))
    let xmax = Math.max(...positions.map(p => (p.x)))
    let ymin = Math.min(...positions.map(p => (p.y)))
    let ymax = Math.max(...positions.map(p => (p.y)))

    xmin -= spacing
    xmax += spacing

    ymin -= spacing
    ymax += spacing

    const W = props.width
    const H = props.height
    const xSpan = xmax - xmin
    const ySpan = ymax - ymin
    let newXSpan = xSpan
    let newYSpan = ySpan
    // Now update either the x- or y-span so that W/H = X/Y
    // (Except we do WY = HX to avoid dealing with division)
    if (W * ySpan < H * xSpan) {
        newYSpan = H * xSpan / W
    } else {
        newXSpan = W * ySpan / H
    }
    const midX = (xmin + xmax) / 2
    const midY = (ymin + ymax) / 2

    xmin = midX - newXSpan / 2
    xmax = midX + newXSpan / 2
    ymin = midY - newYSpan / 2
    ymax = midY + newYSpan / 2

    const xScale = W / newXSpan
    const yScale = H / newYSpan

    return positions.map(p => {
        const x2 = (p.x - xmin) / (xmax - xmin) * W
        const y2 = (p.y - ymin) / (ymax - ymin) * H
        return {
            x: x2 - spacing / 2 * xScale,
            y: y2 - spacing / 2 * yScale,
            w: spacing * xScale,
            h: spacing * yScale
        }
    })
}

const paintElectrodes = (painter: CanvasPainter, props: ExtendedProps) => {
    painter.wipe()
    props.electrodeRects.forEach((r, i) => {
        const boundingRect = {
            xmin: r.x,
            ymin: r.y,
            xmax: r.x + r.w,
            ymax: r.y + r.h
        }
        const e = props.data.electrodes[i]
        let pen = {color: 'gray', width: 2}
        let brush = {color: 'gray'}
        if (props.selectedElectrodeIndices[i]) {
            if (props.hoveredElectrodeIndex === i) {
                pen = {...pen, color: 'blue'}
            }
            else {
                pen = {...pen, color: 'blue'}
            }
        }
        else {
            if (props.hoveredElectrodeIndex === i) {
                pen = {...pen, color: 'orange'}
            }
        }
        painter.fillEllipse(boundingRect, brush)
        painter.drawEllipse(boundingRect, pen)
        if (e.label !== null) {            
            const labelBrush = {...brush, color: 'white'}
            const align = {Horizontal: 'AlignCenter', Vertical: 'AlignCenter'}
            if (!isTextAlignment(align)) throw new Error('Invalid text alignment constant. Should not happen.')
            painter.drawText(boundingRect, align, painter.getDefaultFont(), pen, labelBrush, e.label)
        }
    })
}

const _rectContains = (r: Rect, pos: Vec2) => {
    return (
        (r.x <= pos[0]) &&
        (pos[0] <= r.x + r.w) &&
        (r.y <= pos[1]) &&
        (pos[1] <= r.y + r.h)
    )
}

const _electrodeIndexAt = (extendedProps: ExtendedProps, pos: Vec2): number | null => {
    const a = extendedProps.electrodeRects.map((r, i) => (_rectContains(r, pos) ? i : null)).filter(i => (i !== null))
    return a.length > 0 ? a[0] : null
}
 
const ElectrodeLayoutPlot = (props: Props) => {
    const [hoveredElectrodeIndex, setHoveredElectrodeIndex] = useState<number | null>(null)
    const [selectedElectrodeIndices, setSelectedElectrodeIndices] = useState<{[key: number]: true}>({})

    const extendedProps: ExtendedProps = {
        ...props,
        electrodeRects: computeElectrodeRects(props),
        hoveredElectrodeIndex,
        selectedElectrodeIndices
    }

    const paintElectrodesLayer = useRef<CanvasWidgetLayer<any>>(new CanvasWidgetLayer<ExtendedProps>(paintElectrodes, extendedProps)).current

    useEffect(() => {
        // figure out how to only repaint when needed
        paintElectrodesLayer.setProps(extendedProps)
        paintElectrodesLayer.scheduleRepaint()
    })

    const layers: CanvasWidgetLayer<any>[] = []
    if (props.plotElectrodes) {
        layers.push(paintElectrodesLayer)
    }

    const _handleMouseMove = useCallback((pos: Vec2) => {
        setHoveredElectrodeIndex(_electrodeIndexAt(extendedProps, pos))
    }, [extendedProps])

    const _handleMousePress = useCallback((pos: Vec2) => {
        const i = _electrodeIndexAt(extendedProps, pos)
        if (i === null) {
            setSelectedElectrodeIndices({})
        }
        else {
            setSelectedElectrodeIndices({[i]: true})
        }
    }, [extendedProps])

    return (
        <CanvasWidget
            layers={layers}
            width={props.width}
            height={props.height}
            //onMouseMove={_handleMouseMove}
            onMousePress={_handleMousePress}
            onMouseRelease={() => {}}
            onMouseDrag={() => {}}
            onMouseDragRelease={() => {}}
        />
    )
}

export default ElectrodeLayoutPlot