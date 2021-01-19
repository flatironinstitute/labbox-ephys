import { norm } from 'mathjs'
import React from 'react'
import CanvasWidget from '../../common/CanvasWidget/CanvasWidget'
import { CanvasWidgetLayer, useLayer, useLayers } from '../../common/CanvasWidget/CanvasWidgetLayer'
import { getHeight, getWidth, RectangularRegion } from '../../common/CanvasWidget/Geometry'
import { AnimatedLayerState, handleAnimatedClick, paintAnimationLayer } from './AnimatedLayer'
import { ClickHistoryState, handleClickTrail, paintClickLayer } from './ClickHistoryLayer'
import { DragLayerState, paintDragLayer, setDragLayerStateFromProps, updateDragRegion } from './DragLayer'
import { paintTestLayer } from './ElectrodeGeometryLayer'

export type Electrode = {
    label: string,
    x: number,
    y: number
}

export interface ElectrodeGeometryProps {
    electrodes: Electrode[]
}

export interface ElectrodeLayerProps extends ElectrodeGeometryProps {
    width: number
    height: number
    scaledCoordinates: RectangularRegion
    electrodeRadius: number
}

const computeElectrodeCoordinates = (electrodes: Electrode[]): {scaledCoordinates: RectangularRegion, electrodeRect: RectangularRegion} => {
    // we don't actually know the number or locations of the electrodes.
    // Read the data to figure out an appropriate scale.
    const electrodeXs = electrodes.map((point) => point.x)
    const electrodeYs = electrodes.map((point) => point.y)
    
    const electrodeRect = {
        xmin: Math.min(...electrodeXs),
        xmax: Math.max(...electrodeXs),
        ymin: Math.min(...electrodeYs),
        ymax: Math.max(...electrodeYs)
    }

    // Assuming we want to keep the origin in the range, while the min point is not at (0,0), a perfect
    // fit to min((0,0), lowest-left point) and maxes will give more bottom-left margin than top or right margin.
    // To compensate, xmax and ymax need to include padding from their maxes up to the difference b/w min and 0.
    // This isn't put forward as The Correct Answer for electrode layout, just a basis for the proof-of-concept.
    const extraXoffsetFrom0 = Math.max(electrodeRect.xmin, 0)
    const extraYoffsetFrom0 = Math.max(electrodeRect.ymin, 0)

    const electrodeRanges = {
        xmin: Math.min(electrodeRect.xmin, 0),
        ymin: Math.min(electrodeRect.ymin, 0),
        xmax: Math.max(electrodeRect.xmax, electrodeRect.xmax + extraXoffsetFrom0),
        ymax: Math.max(electrodeRect.ymax, electrodeRect.ymax + extraYoffsetFrom0)
    }
    // keep it square -- TODO: Should we actually worry about the aspect ratio of the underlying canvas?
    const side = Math.max(getWidth(electrodeRanges), getHeight(electrodeRanges))
    // add a margin
    const margin = side * .05
    const scaledCoordinates = {
        xmin: electrodeRanges.xmin - margin,
        xmax: electrodeRanges.xmin + side + margin,
        ymin: electrodeRanges.ymin - margin,
        ymax: electrodeRanges.ymin + side + margin
    }

    return {scaledCoordinates: scaledCoordinates, electrodeRect: electrodeRect}
}

const computeRadius = (electrodes: Electrode[], scaledCoordinates: RectangularRegion, electrodeRect: RectangularRegion): number => {
    // how big should each electrode dot be? Really depends on how close
    // the dots are to each other. Let's find the closest pair of dots and
    // set the radius to 40% of the distance between them.
    let leastNorm = Math.min(electrodeRect.xmin - scaledCoordinates.xmin, electrodeRect.ymin - scaledCoordinates.ymin,
                             scaledCoordinates.xmax - electrodeRect.xmax, scaledCoordinates.ymax - electrodeRect.ymax)
    electrodes.forEach((point) => {
        electrodes.forEach((otherPoint) => {
            const dist = norm([point.x - otherPoint.x, point.y - otherPoint.y])
            if (dist === 0) return
            leastNorm = Math.min(leastNorm, dist as number)
        })
    })
    const radius = 0.4 * leastNorm
    return radius
}

export const setCanvasFromProps = (layer: CanvasWidgetLayer<ElectrodeLayerProps, any>, layerProps: ElectrodeLayerProps) => {
    // layer.setBasePixelTransformationMatrix(layerProps.scaledCoordinates)
}

const createTestLayer = () => {
    return new CanvasWidgetLayer<ElectrodeLayerProps, object>(paintTestLayer, setCanvasFromProps,
        {},
        {   // note, temporarily not importing the reporting functions since we aren't using them right now
            discreteMouseEventHandlers: [], //[reportMouseMove, reportMouseClick], // these get REAL chatty
            dragHandlers: []//reportMouseDrag],
        }
    )
}

const createDragLayer = () => {
    return new CanvasWidgetLayer<ElectrodeLayerProps, DragLayerState>(paintDragLayer, setDragLayerStateFromProps,
        {
            dragRegion: null,
            electrodeBoundingBoxes: [],
            selectedElectrodes: [],
            draggedElectrodes: []
        },
        {
            discreteMouseEventHandlers: [],
            dragHandlers: [updateDragRegion]
        }
    )
}

const createClickLayer = () => {
    return new CanvasWidgetLayer<ElectrodeLayerProps, ClickHistoryState>(paintClickLayer, setCanvasFromProps,
        {
            clickHistory: []
        },
        {
            discreteMouseEventHandlers: [handleClickTrail],
            dragHandlers: []
        }
    )
}

const createAnimatedLayer = () => {
    return new CanvasWidgetLayer<ElectrodeLayerProps, AnimatedLayerState>(paintAnimationLayer, setCanvasFromProps,
        {
            points: [],
            newQueue: []
        },
        {  
            discreteMouseEventHandlers: [handleAnimatedClick],
            dragHandlers: []
        }
    )
}

const ElectrodeGeometry = (props: ElectrodeGeometryProps) => {
    const width = 200
    const height = 200
    const { electrodes } = props
    const { scaledCoordinates, electrodeRect } = computeElectrodeCoordinates(electrodes)
    const radius = computeRadius(electrodes, scaledCoordinates, electrodeRect)
    const layerProps = {
        ...props,
        width: width,
        height: height,
        scaledCoordinates: scaledCoordinates,
        electrodeRect: electrodeRect,
        electrodeRadius: radius,
    }

    const testLayer = useLayer(createTestLayer, layerProps)
    const dragLayer = useLayer(createDragLayer, layerProps)
    const clickLayer = useLayer(createClickLayer, layerProps)
    const animatedLayer = useLayer(createAnimatedLayer, layerProps)

    const layers = useLayers([testLayer, dragLayer, clickLayer, animatedLayer])

    return (
        <CanvasWidget
            key='canvas'
            layers={layers}
            {...{width, height}}
        />
    )
}

export default ElectrodeGeometry