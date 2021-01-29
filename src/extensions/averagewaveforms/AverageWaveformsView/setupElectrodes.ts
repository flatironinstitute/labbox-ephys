import { norm } from 'mathjs';
import { getArrayMax, getArrayMin } from '../../../util/Utility';
import { funcToTransform } from '../../common/CanvasWidget';
import { getBoundingBoxForEllipse, getHeight, getWidth, RectangularRegion, TransformationMatrix, transformDistance, Vec2 } from '../../common/CanvasWidget/Geometry';

export type ElectrodeBox = {
    label: string
    id: number
    x: number
    y: number
    rect: RectangularRegion
    transform: TransformationMatrix
}

const computeRadiusCache = new Map<string, number>()
const computeRadius = (electrodeLocations: number[][]): number => {
    const key = JSON.stringify(electrodeLocations)
    const val = computeRadiusCache.get(key)
    if (val !== undefined) {
        return val
    }
    // how big should each electrode dot be? Really depends on how close
    // the dots are to each other. Let's find the closest pair of dots and
    // set the radius to 40% of the distance between them.
    let leastNorm = Number.MAX_VALUE
    electrodeLocations.forEach((point) => {
        electrodeLocations.forEach((otherPoint) => {
            const dist = norm([point[0] - otherPoint[0], point[1] - otherPoint[1]])
            if (dist === 0) return
            leastNorm = Math.min(leastNorm, dist as number)
        })
    })
    // (might set a hard cap, but remember these numbers are in electrode-space coordinates)
    const radius = 0.45 * leastNorm
    computeRadiusCache.set(key, radius)
    return radius
}

const getElectrodesBoundingBox = (electrodeLocations: number[][], radius: number): RectangularRegion => {
    return {
        xmin: getArrayMin(electrodeLocations.map(e => (e[0]))) - radius,
        xmax: getArrayMax(electrodeLocations.map(e => (e[0]))) + radius,
        ymin: getArrayMin(electrodeLocations.map(e => (e[1]))) - radius,
        ymax: getArrayMax(electrodeLocations.map(e => (e[1]))) + radius
    }
}

export const getElectrodesAspectRatio = (electrodeLocations: Vec2[]) => {
    const radius = computeRadius(electrodeLocations)
    const boundingBox = getElectrodesBoundingBox(electrodeLocations, radius)
    const boxAspect = getWidth(boundingBox) / getHeight(boundingBox)
    return boxAspect
}

const setupVerticalElectrodes = ({width, height, electrodeIds}: {width: number, height: number, electrodeIds: number[]}) => {
    const xMargin = 10
    const yMargin = 10
    const n = electrodeIds.length
    
    const transform = funcToTransform((p: Vec2): Vec2 => {
        const x = xMargin + p[0] * ( width - 2 * xMargin )
        const y = yMargin + p[1] * ( height - 2 * yMargin )
        return [x, y]
    })

    const electrodeBoxes: ElectrodeBox[] = electrodeIds.map((eid, ii) => {
        const y = (0.5 + ii) / (n + 1)
        const rect = {xmin: 0, xmax: 1, ymin: y - 0.5 / (n + 1), ymax: y + 0.5 / (n + 1)}
        const transform0 = funcToTransform((p: Vec2): Vec2 => {
            const a = rect.xmin + p[0] * (rect.xmax - rect.xmin)
            const b = rect.ymin + p[1] * (rect.ymax - rect.ymin)
            return [a, b]
        })
        return {
            label: eid + '',
            id: eid,
            x: 0.5,
            y,
            rect,
            transform: transform0
        }
    })

    
    return {
        electrodeBoxes,
        transform,
        radius: 1 / (n + 1),
        pixelRadius: height / (n + 1)
    }
}

const setupElectrodes = (args: {width: number, height: number, electrodeLocations: Vec2[], electrodeIds: number[], layoutMode: 'geom' | 'vertical'}): {
    electrodeBoxes: ElectrodeBox[],
    transform: TransformationMatrix,
    radius: number,
    pixelRadius: number
} => {
    const { width, height, electrodeLocations, electrodeIds, layoutMode } = args
    if (layoutMode === 'vertical') {
        return setupVerticalElectrodes({width, height, electrodeIds})
    }
    const W = width - 10 * 2
    const H = height - 10 * 2
    const canvasAspect = W / H

    const radius = computeRadius(electrodeLocations)
    let boundingBox = getElectrodesBoundingBox(electrodeLocations, radius)
    let boxAspect = getWidth(boundingBox) / getHeight(boundingBox)

    let realizedElectrodeLocations = electrodeLocations
    if ((boxAspect > 1) !== (canvasAspect > 1)) {
        // if the two aspect ratios' relationship to 1 is different, then one is portrait
        // and the other landscape. We should then correct by rotating the electrode set 90 degrees.
        // note: a 90-degree right rotation in 2d makes x' = y and y' = -x
        realizedElectrodeLocations = electrodeLocations.map((loc) => {
            return [loc[1], -loc[0]]
        })
        // and of course that also means resetting the x- and y-ranges of the bounding box.
        boundingBox = { xmin: boundingBox.ymin, xmax: boundingBox.ymax, ymin: -boundingBox.xmax, ymax: -boundingBox.xmin }
        boxAspect = getWidth(boundingBox) / getHeight(boundingBox)
    }

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

    const electrodeBoxes: ElectrodeBox[] = realizedElectrodeLocations.map((loc, i) => { 
        const x = loc[0]
        const y = loc[1]
        const rect = getBoundingBoxForEllipse([x, y], radius, radius)
        const transform0 = funcToTransform((p: Vec2): Vec2 => {
            const a = rect.xmin + p[0] * (rect.xmax - rect.xmin)
            const b = rect.ymin + p[1] * (rect.ymax - rect.ymin)
            return [a, b]
        })
        return { label: electrodeIds[i] + '', id: electrodeIds[i], x: x, y: y, rect, transform: transform0}}
    )
    const pixelRadius = transformDistance(transform, [radius, 0])[0]
    return {electrodeBoxes, transform, radius, pixelRadius}
}

export default setupElectrodes