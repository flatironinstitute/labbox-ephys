import { abs, inv, matrix, multiply } from 'mathjs'

export type Vec2 = number[]
export const isVec2 = (x: any): x is Vec2 => {
    if ((x) && (Array.isArray(x)) && (x.length === 2)) {
        for (let a of x) {
            if (!isNumber(a)) return false
        }
        return true
    }
    else return false
}

export type Vec3 = number[]
export const isVec3 = (x: any): x is Vec2 => {
    if ((x) && (Array.isArray(x)) && (x.length === 3)) {
        for (let a of x) {
            if (!isNumber(a)) return false
        }
        return true
    }
    else return false
}

export type Vec4 = number[]
export const isVec4 = (x: any): x is Vec4 => {
    if ((x) && (Array.isArray(x)) && (x.length === 4)) {
        for (let a of x) {
            if (!isNumber(a)) return false
        }
        return true
    }
    else return false
}

// Two-dimensional point in 3-dimensional (homogeneous-coordinate) vector space.
// For our purposes right now the perspective dimension (3rd position) should be 1, we're just using
// unit values to facilitate translations of points/figures, not for actual scaling
export type Vec2H = number[]
export const isVec2H = (x: any): x is Vec2H => {
    if ((x) && (Array.isArray(x)) && (x.length === 3)) {
        for (let a of x) {
            if (!isNumber(a)) return false
        }
        return x[2] === 1
    }
    return false
}
export const homogenizeVec2 = (v: Vec2): Vec2H => {
    return [v[0], v[1], 1]
}
export const Vec2HToVector = (v: Vec2H): math.Matrix => {
    // mathjs uses geometric dimensions. If we pass a 1-dimensional array, the resulting
    // vector is treated as a column vector for matrix multiplication.
    return matrix(v);
}

export type RectangularRegion = {
    xmin: number,
    xmax: number,
    ymin: number,
    ymax: number
}
export const isRectangularRegion = (x: any): x is RectangularRegion => {
    for (const prop of ['xmin', 'xmax', 'ymin', 'ymax']) {
        if (!x.hasOwnProperty(prop)) return false
        if (!isNumber(x[prop])) return false
    }
    if (x.xmin > x.xmax) return false
    if (x.ymin > x.ymax) return false // TODO: Delete this? It doesn't hold for pixelspace regions!
    return true
}
export const rectsAreEqual = (a: RectangularRegion, b: RectangularRegion) => {
    if (!isRectangularRegion(a) || !isRectangularRegion(b)) return false
    return (a.xmin === b.xmin &&
            a.xmax === b.xmax && 
            a.ymin === b.ymin &&
            a.ymax === b.ymax)
}
export const getWidth = (region: RectangularRegion): number => {
    return region.xmax - region.xmin
}
export const getHeight = (region: RectangularRegion): number => {
    return abs(region.ymax - region.ymin) // y-axis is inverted in conversion to pixelspace
}
export const getCenter = (region: RectangularRegion): Vec2 => {
    // Math.min() is used because we don't know if we're in pixelspace or not.
    // If we have converted to pixelspace, then ymin > ymax. But we can't just choose one,
    // because we want this function to work for both inverted and standard coordinate systems.
    return [region.xmin + (getWidth(region) / 2), Math.min(region.ymin, region.ymax) + (getHeight(region) / 2)]
}
export const pointSpanToRegion = (pointSpan: Vec4): RectangularRegion => {
    // expected: pointSpan will have form [0] = xmin, [1] = ymin, [2] = width, [3] = height
    return {
        xmin: pointSpan[0],
        ymin: pointSpan[1],
        xmax: pointSpan[0] + pointSpan[2],
        ymax: pointSpan[1] + pointSpan[3]
    }
}
export const rectangularRegionsIntersect = (r1: RectangularRegion, r2: RectangularRegion): boolean => {
    // R1 and R2 intersect IFF: (R1.ymin < R2.ymin < R1.ymax || R1.ymin < R2.ymax < R1.ymax) && (same, for the xs)
    // or the same, swapping R1 and R2. *BUT* that's a lot of comparisons. Easier to check if they DON'T intersect:
    // R1 and R2 DON'T intersect IFF: R1.ymin > R2.ymax, or R1.ymax < R2.ymin; or the same for the xs.
    if ((r1.xmax < r2.xmin) || (r1.xmin > r2.xmax)) return false
    if ((r1.ymax < r2.ymin) || (r1.ymin > r2.ymax)) return false
    return true
}

// TODO: This file should probably be split up. It's starting to have several peripherally-related components.

// Presumably axis-aligned. These can be treated as lengths or as
// defining the points (left, top) and (right, bottom).
export type RectBySides = {
    left: number,
    right: number,
    top: number,
    bottom: number
}

export type RectOptionalSides = {
    left?: number,
    right?: number,
    top?: number,
    bottom?: number
}

// Axis-aligned rectangle defined by an upper left (lowest values) point
// and a width and height.
export type RectPointAndWidth = {
    x: number,
    y: number,
    width: number,
    height: number
}

export type TransformationMatrix = Vec3[]
export const isTransformationMatrix = (x: any): x is TransformationMatrix => {
    if ((x) && (Array.isArray(x)) && (x.length === 3)) {
        for (let row of x) {
            if (!isVec3(row)) return false
        }
        if (JSON.stringify(x[2]) === JSON.stringify([0, 0, 1])) return true
    }
    return false
}
export const toTransformationMatrix = (x: math.Matrix): TransformationMatrix => {
    if (JSON.stringify(x.size()) === JSON.stringify([3, 3])) {
        const asArray = x.toArray() as number[][]
        if (JSON.stringify(asArray[2]) === JSON.stringify([0, 0, 1])){
            return asArray as TransformationMatrix
        }
    }
    throw Error(`Matrix ${JSON.stringify(x)} is invalid as a transform matrix.`)
}
export const getTransformationMatrix = (newSystem: RectangularRegion, targetRangeInCurrentSystem: RectangularRegion): TransformationMatrix => {
    const newWidth = getWidth(newSystem)
    const newHeight = getHeight(newSystem)
    const targetRegionWidth = getWidth(targetRangeInCurrentSystem)
    const targetRegionHeight = getHeight(targetRangeInCurrentSystem)

    // we want to build a matrix that converts points in the new system to points in the current system.
    // This is going to have four partitions: The upper left partition is a 2x2 scaling matrix, basically an identity
    // matrix with the x-scale and y-scale instead of unity. The upper right column is a 2x1 (column) vector which has
    // the (xmin, ymin)^T of the rectangle defining the window (within the current coordinate system) that we'll use.
    // Then on the bottom we have a 1x2 row of zeroes and a 1x1 'matrix' with a value of 1.
    const xscale = targetRegionWidth / newWidth
    const yscale = targetRegionHeight / newHeight
    const matrix = [[xscale,         0,     targetRangeInCurrentSystem.xmin - (newSystem.xmin * xscale)],
                    [     0,    yscale,     targetRangeInCurrentSystem.ymin - (newSystem.ymin * yscale)],
                    [     0,         0,                                   1]  ] as TransformationMatrix
    return matrix
}
export const getInverseTransformationMatrix = (t: TransformationMatrix): TransformationMatrix => {
    const tmatrix = matrix(t)
    const inverse = inv(tmatrix).toArray() as number[][]
    return inverse as TransformationMatrix
}

export const transformXY = (tmatrix: TransformationMatrix, x: number, y: number): Vec2H => {
    return transformPoint(tmatrix, homogenizeVec2([x, y]))
}

export const transformPoint = (tmatrix: TransformationMatrix, point: Vec2H): Vec2H => {
    const A = matrix(tmatrix)
    const x = matrix(point)
    const b = multiply(A, x)
    return b.toArray() as Vec2H
}

export const transformRect = (tmatrix: TransformationMatrix, rect: RectangularRegion): RectangularRegion => {
    const A = matrix(tmatrix)
    const corners = matrix([[rect.xmin, rect.xmax], [rect.ymin, rect.ymax], [1, 1]]) // note these are manually transposed column vectors.
    const newCorners = multiply(A, corners).toArray() as number[][]
    // And the result is also column vectors, so we want [0][0] = new xmin, [1][0] = new ymin, [0][1] = new xmax, [1][1] = new ymax
    return {
        xmin: newCorners[0][0],
        xmax: newCorners[0][1],
        ymin: newCorners[1][0],
        ymax: newCorners[1][1]
    }
}

export const transformDistance = (tmatrix: TransformationMatrix, xyDist: Vec2): Vec2 => {
    // if transforming a distance, we actually want to set the perspective dimension (the w of the
    // [x, y, w] vector) to 0, so the transform matrix applies scaling without transposition.
    const A = matrix(tmatrix)
    const x = matrix([xyDist[0], xyDist[1], 0])
    const b = multiply(A, x)
    const scaled = abs(b).toArray() as number[] // take absolute value to ensure we don't get negative distances
    return [scaled[0], scaled[1]]
}

export const isNumber = (x: any): x is number => {
    return ((x !== null) && (x !== undefined) && (typeof(x) === 'number'))
}

export const isString = (x: any): x is string => {
    return ((x !== null) && (x !== undefined) && (typeof(x) === 'string'))
}

interface TextAlignment {
    Horizontal: 'AlignLeft' | 'AlignCenter' | 'AlignRight'
    Vertical: 'AlignTop' | 'AlignCenter' | 'AlignBottom'
}
export const isTextAlignment = (x: any): x is TextAlignment => {
    switch (x.Horizontal) {
        case 'AlignLeft':
        case 'AlignCenter':
        case 'AlignRight':
            break
        default:
            return false
    }
    switch (x.Vertical) {
        case 'AlignTop':
        case 'AlignCenter':
        case 'AlignBottom':
            break
        default:
            return false
    }
    return true
}

interface TextAlignmentConfig {
    x: number
    y: number
    textAlign: 'left' | 'center' | 'right'
    textBaseline: 'bottom' | 'middle' | 'top'
}

const getTextAlignmentConfig = (rect: RectangularRegion, alignment: TextAlignment, t: TransformationMatrix): TextAlignmentConfig => {
    const rect2 = transformRect(t, rect)
    let x, y
    let textAlign = 'left'
    let textBaseline = 'bottom'
    switch (alignment.Horizontal) {
        case 'AlignLeft':
            x = rect2.xmin
            textAlign = 'left'
            break
        case 'AlignCenter':
            x = getCenter(rect2)[0]
            textAlign = 'center'
            break
        case 'AlignRight':
            x = rect2.xmax
            textAlign = 'right'
            break
        default: // can't happen
            throw new Error('Missing horizontal alignment in drawText: AlignLeft, AlignCenter, or AlignRight');
        }
    switch (alignment.Vertical) {
        case 'AlignBottom':
            y = rect2.ymin
            textBaseline = 'bottom'
            break
        case 'AlignCenter':
            y = getCenter(rect2)[1]
            textBaseline = 'middle'
            break
        case 'AlignTop':
            y = rect2.ymax
            textBaseline = 'top'
            break
        default: // can't happen
            throw new Error('Missing vertical alignment in drawText: AlignTop, AlignBottom, or AlignVCenter');
    }
    return {x: x, y: y, textAlign: textAlign, textBaseline: textBaseline} as TextAlignmentConfig

}


// html5 canvas context
export interface Context2D {
    clearRect: (x: number, y: number, W: number, H: number) => void,
    save: () => void,
    restore: () => void,
    clip: () => void,
    translate: (dx: number, dy: number) => void
    rotate: (theta: number) => void
    fillRect: (x: number, y: number, W: number, H: number) => void
    strokeRect: (x: number, y: number, W: number, H: number) => void
    beginPath: () => void
    moveTo: (x: number, y: number) => void
    lineTo: (x: number, y: number) => void
    stroke: () => void
    fill: () => void
    ellipse: (x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number) => void
    fillStyle: string
    strokeStyle: string
    lineWidth: number
    font: string
    textAlign: string
    textBaseline: string
    fillText: (txt: string, x: number, y: number) => void
}

export interface CanvasWidgetLayer {
    width: () => number,
    height: () => number
}

type Color = 'black' | 'red' | 'blue' | 'transparent' | string
// TODO: Define additional colors w/ lookup table?

export interface Pen {
    color: Color,
    width?: number // N.B. as of right now this is ALWAYS IN PIXELS, regardless of coordinate system.
    // This is somewhat inconsistent, but a) it's probably what you actually want, and b) it'd be annoying to change.
}

export interface Font {
    "pixel-size": number,
    family: 'Arial' | string
}

export interface Brush {
    color: Color
}
export const isBrush = (x: any): x is Brush => {
    if (!x) return false
    if (typeof(x) !== 'object') return false
    if (!('color' in x)) return false
    return true
}


export class CanvasPainter {
    #exportingFigure: boolean = false
    #context2D: Context2D
    #canvasLayer: CanvasWidgetLayer
    #coordRange: RectangularRegion
    #transformMatrix: TransformationMatrix
    #inverseMatrix: TransformationMatrix
    constructor(context2d: Context2D, canvasLayer: CanvasWidgetLayer, transformMatrix?: TransformationMatrix) {
        this.#context2D = context2d
        this.#canvasLayer = canvasLayer
        this.#coordRange = { xmin: 0, ymin: 0, xmax: 1, ymax: 1 }
        this.#transformMatrix = transformMatrix || this.setBaseTransformationMatrix()
        this.#inverseMatrix = getInverseTransformationMatrix(this.#transformMatrix)
    }

    applyNewTransformationMatrix(newTransform: TransformationMatrix): CanvasPainter {
        // transforming from a coordinate system to pixelspace is written as Ax = b, where:
        // b is the (homogeneous) vector in pixel space
        // x is the (homogeneous) vector in the current coordinate system
        // A is the transformation matrix converting x to b.
        // If we have current transformation A mapping vectors x to pixelspace b, and we want a
        // new transformation T mapping new vectors w to pixelspace vectors b, then this is:
        //      T = AB
        // where B maps vectors w (in the 'new' system) to x (the 'current' coordinate system).
        // (Let Bw = x --> A(Bw) = A(x) [= b] --> (AB)w = b; T = AB, then Tw = b. QED.)
        // This function computes T from A and B and returns a copy of the current CanvasPainter with #transformMatrix set to T.

        const A = matrix(this.#transformMatrix)
        const B = matrix(newTransform)
        const T = multiply(A, B)

        const copy = new CanvasPainter(this.#context2D, this.#canvasLayer, toTransformationMatrix(T))
        return copy
    }

    getNewTransformationMatrix(newSystem: RectangularRegion, targetRangeInCurrentSystem?: RectangularRegion): TransformationMatrix {
        let targetRange: RectangularRegion = targetRangeInCurrentSystem || this.#coordRange
        return getTransformationMatrix(newSystem, targetRange)
    }

    // Sets up the transformation matrix that converts from the default coordinate space to pixelspace.
    // This matrix ALSO inverts the y-axis so that (0,0) is the bottom left corner of the coordinate
    // space, even though it is the top left corner of the canvas/pixelspace.
    setBaseTransformationMatrix(canvasLayer?: CanvasWidgetLayer): TransformationMatrix {
        const layer = canvasLayer || this.#canvasLayer
        if (!layer) throw Error('Cannot build default transformation matrix with no canvas.')
        const shape = layer.width() === layer.height() ? 'square' :
                      layer.width() > layer.height() ? 'landscape' : 'portrait'
        // compute aspect ratio: this ensures that any base coordinate system presents square pixels to
        // the user. Subsequent transforms could change this, but better not to draw warped out of the box
        const aspectRatio = Math.max(layer.width(), layer.height()) / Math.min(layer.width(), layer.height())
        let coordRange = {xmin: 0, ymin: 0, xmax: 1, ymax: 1}
        // in the event of non-square canvas, make the shorter side have unit dimension in default
        // coordinate space. So we get 1:1.6 rather than 0.625:1.
        if (shape !== 'square') {
            if (shape === 'landscape') coordRange = {...coordRange, xmax: aspectRatio}
            if (shape === 'portrait') coordRange = {...coordRange, ymax: aspectRatio}
        }
        let systemsRatio = layer.width() / coordRange.xmax
        this.#coordRange = coordRange
        return [[systemsRatio,  0,                               0],
                [0,             -1 * systemsRatio,  layer.height()],
                [0,             0,                               1]] as any as TransformationMatrix
    }

    getCoordRange(): RectangularRegion {
        return this.#coordRange
    }
    // FOR DEBUGGING ONLY: To be removed once things are sorted
    printCanvasDimensions() {
        console.log(`w: ${this.#canvasLayer.width()}, h: ${this.#canvasLayer.height()}`)
    }
    // TODO: Delete these default methods?
    getDefaultPen() {
        return { color: 'black' }
    }
    getDefaultFont() {
        return { "pixel-size": 12, family: 'Arial' }
    }
    getDefaultBrush() {
        return { color: 'black' }
    }
    getTransformationMatrix() {
        return this.#transformMatrix
    }
    getInverseTransformationMatrix() {
        return this.#inverseMatrix
    }
    createPainterPath() {
        return new PainterPath()
    }
    setExportingFigure(val: boolean) {
        this.#exportingFigure = val
    }
    exportingFigure() {
        return this.#exportingFigure
    }
    clear(): void {
        this.clearRect( {xmin: 0, ymin: 0, xmax: this.#canvasLayer.width(), ymax: this.#canvasLayer.height()} );
    }
    clearRect(rect: RectangularRegion) {
        this.fillRect(rect, {color: 'transparent'})
    }
    ctxSave() {
        this.#context2D.save();
    }
    ctxRestore() {
        this.#context2D.restore();
    }
    wipe(): void {
        this.#context2D.clearRect(0, 0, this.#canvasLayer.width(), this.#canvasLayer.height());
    }
    ctxTranslate(dx: number | Vec2, dy: number | undefined = undefined) {
        if (dy === undefined) {
            if (typeof dx === 'number') {
                throw Error('unexpected');
            }
            let tmp = dx;
            dx = tmp[0];
            dy = tmp[1];
            this.#context2D.translate(dx, dy);
        }
        if (typeof dx === 'object') {
            throw Error('Bad signature: dx object and dy not undef: ctxTranslate')
        }
        this.#context2D.translate(dx, dy);
    }
    ctxRotate(theta: number) {
        this.#context2D.rotate(theta)
    }
    width() {
        return this.#canvasLayer.width()
    }
    height() {
        return this.#canvasLayer.height()
    }
    fillRect(rect: RectangularRegion, brush: Brush) {
        const pr = transformRect(this.#transformMatrix, rect) // covert rect to pixelspace
        // console.log(`Transformed ${JSON.stringify(rect)} to ${JSON.stringify(pr)}`)
        // console.log(`Measure (pixelspace) width: ${getWidth(pr)}, height: ${getHeight(pr)}`)
        this.#context2D.save()
        this.#context2D.fillStyle = toColorStr(brush.color) // TODO: create an applyBrush() function?
        // NOTE: Due to the pixelspace-conversion axis flip, the height should be negative.
        this.#context2D.fillRect(pr.xmin, pr.ymin, getWidth(pr), -getHeight(pr))
        this.#context2D.restore()
    }
    drawRect(rect: RectangularRegion, pen: Pen) {
        const pr = transformRect(this.#transformMatrix, rect) // convert rect to pixelspace
        this.#context2D.save()
        applyPen(this.#context2D, pen)
        // NOTE: Due to the pixelspace-conversion axis flip, the height should be negative.
        this.#context2D.strokeRect(pr.xmin, pr.ymin, getWidth(pr), -getHeight(pr))
        this.#context2D.restore()
    }

    getEllipseFromBoundingRect(boundingRect: RectangularRegion) {
        const r = transformRect(this.#transformMatrix, boundingRect)
        const center = getCenter(r)
        const W = getWidth(r)
        const H = getHeight(r)
        return {center, W, H}
    }

    // TODO: Looks like the earlier version was actually getting passed the least corner and the width/height:
    //        --> this.#context2D.ellipse(x + W / 2, y + H / 2, W / 2, H / 2, 0, 0, 2 * Math.PI)
    fillEllipse(boundingRect: RectangularRegion, brush: Brush) {
        const {center, W, H} = {...this.getEllipseFromBoundingRect(boundingRect)}
        this.#context2D.save()
        this.#context2D.fillStyle = toColorStr(brush.color)
        this.#context2D.beginPath()
        this.#context2D.ellipse(center[0], center[1], W/2, H/2, 0, 0, 2 * Math.PI)
        this.#context2D.fill()
        this.#context2D.restore()
    }
    drawEllipse(boundingRect: RectangularRegion, pen: Pen) {
        const {center, W, H} = {...this.getEllipseFromBoundingRect(boundingRect)}
        this.#context2D.save()
        applyPen(this.#context2D, pen)
        console.log(`Attempting to draw ellipse: ${center[0]} ${center[1]} ${W/2} ${H/2}`)
        this.#context2D.beginPath()
        this.#context2D.ellipse(center[0], center[1], W/2, H/2, 0, 0, 2 * Math.PI)
        this.#context2D.stroke()
        this.#context2D.restore()
    }
    drawPath(painterPath: PainterPath, pen: Pen) {
        this.#context2D.save()
        applyPen(this.#context2D, pen)
        painterPath._draw(this.#context2D, this.#transformMatrix)
        this.#context2D.restore()
    }
    drawLine(x1: number, y1: number, x2: number, y2: number, pen: Pen) {
        const pPath = new PainterPath();
        pPath.moveTo(x1, y1);
        pPath.lineTo(x2, y2);
        this.drawPath(pPath, pen);
    }
    drawText(rect: RectangularRegion, alignment: TextAlignment, font: Font, pen: Pen, brush: Brush, txt: string) {
        const config = getTextAlignmentConfig(rect, alignment, this.#transformMatrix)
        this.#context2D.save()
        applyFont(this.#context2D, font)
        applyTextAlignment(this.#context2D, config)
        applyPen(this.#context2D, pen);
        applyBrush(this.#context2D, brush)
        this.#context2D.fillText(txt, config.x, config.y);
        this.#context2D.restore()
    }
    // in future we may want to implement this:
    // this.createImageData = function(W, H) {
    //     return ctx.getImageData(W, H);
    // }
    // this.putImageData = function(imagedata, x, y) {
    //     ctx.putImageData(imagedata, x, y);
    // }
    // this.drawImage = function(image, dx, dy) {
    //     ctx.drawImage(image, dx, dy);
    // }

    // TODO: implement markers
    // this.drawMarker = function(x, y, radius, shape, opts) {
    //     opts = opts || {};
    //     let pt = transformXY(x, y);
    //     _drawMarker(pt[0], pt[1], radius, shape, opts);
    // }
    // function _drawMarker(x, y, radius, shape, opts) {
    //     shape = shape || 'circle';
    //     let rect = [x-radius, y-radius, 2*radius, 2*radius];
    //     if (shape === 'circle') {
    //         if (opts.fill) {
    //             _fillEllipse(rect);
    //         }
    //         else {
    //             _drawEllipse(rect);
    //         }
    //     }
    //     else {
    //         console.error(`Unrecognized marker shape ${shape}`);
    //     }
    // }
    // this.fillMarker = function(x, y, radius, shape) {
    //     let pt = transformXY(x, y);
    //     _drawMarker(pt[0], pt[1], radius, shape, {fill: true});
    // }

    //// Interpreting clicks
    clickToCoordinateSystem(pointInPixelspace: Vec2) {
        return transformXY(this.#inverseMatrix, pointInPixelspace[0], pointInPixelspace[1])
    }
}

interface PainterPathAction {
    name: 'moveTo' | 'lineTo'
    x: number
    y: number
}

export class PainterPath {
    #actions: PainterPathAction[] = []
    moveTo(x: number | Vec2, y: number | undefined = undefined): void {
        if (isVec2(x)) {
            return this.moveTo(x[0], x[1])
        }
        if (!isNumber(y)) throw Error('unexpected')
        this.#actions.push({
            name: 'moveTo',
            x,
            y
        })
    }
    lineTo(x: number | Vec2, y: number | undefined = undefined): void {
        if (isVec2(x)) {
            return this.lineTo(x[0], x[1])
        }
        if (!isNumber(y)) throw Error('unexpected')
        this.#actions.push({
            name: 'lineTo',
            x,
            y
        })
    }
    _draw(ctx: Context2D, tmatrix: TransformationMatrix) {
        ctx.beginPath();
        const actions = this._transformPathPoints(tmatrix)
        actions.forEach(a => {
            this._applyAction(ctx, a)
        })
        ctx.stroke();
    }
    _applyAction(ctx: Context2D, a: PainterPathAction) {
        if (a.name === 'moveTo') {
            ctx.moveTo(a.x, a.y);
        }
        else if (a.name === 'lineTo') {
            ctx.lineTo(a.x, a.y);
        }
    }
    _transformPathPoints(tmatrix: TransformationMatrix): PainterPathAction[] {
        const A = matrix(tmatrix)
        return this.#actions.map((a) => {
            const x = matrix([a.x, a.y, 1])
            const b = multiply(A, x).toArray() as number[]
            return {...a, x: b[0], y: b[1] }
        })
    }
}

const toColorStr = (col: string | Vec3): string => {
    // TODO: Could do more validity check here
    if (isString(col)) return col
    else if (isVec3(col)) {
        return 'rgb(' + Math.floor(col[0]) + ',' + Math.floor(col[1]) + ',' + Math.floor(col[2]) + ')'
    }
    else {
        throw Error('unexpected')
    }
}

const applyPen = (ctx: Context2D, pen: Pen) => {
    const color = pen.color || 'black'
    const lineWidth = (isNumber(pen.width)) ? pen.width : 1
    ctx.strokeStyle = toColorStr(color)
    ctx.lineWidth = lineWidth
}

const applyBrush = (ctx: Context2D, brush: Brush) => {
    const color = 'color' in brush ? brush.color : 'black'
    ctx.fillStyle = toColorStr(color)
}

const applyFont = (ctx: Context2D, font: Font) => {
    const size = font['pixel-size'] || '12'
    const face = font.family || 'Arial'
    ctx.font = `${size}px ${face}`
}

const applyTextAlignment = (ctx: Context2D, alignment: TextAlignmentConfig) => {
    ctx.textAlign = alignment.textAlign
    ctx.textBaseline = alignment.textBaseline
}


// todo: mouse handler
// export function MouseHandler() {
//     this.setElement = function (elmt) { m_element = elmt; };
//     this.onMousePress = function (handler) { m_handlers['press'].push(handler); };
//     this.onMouseRelease = function (handler) { m_handlers['release'].push(handler); };
//     this.onMouseMove = function (handler) { m_handlers['move'].push(handler); };
//     this.onMouseEnter = function (handler) { m_handlers['enter'].push(handler); };
//     this.onMouseLeave = function (handler) { m_handlers['leave'].push(handler); };
//     this.onMouseWheel = function (handler) { m_handlers['wheel'].push(handler); };
//     this.onMouseDrag = function (handler) { m_handlers['drag'].push(handler); };
//     this.onMouseDragRelease = function (handler) { m_handlers['drag_release'].push(handler); };

//     this.mouseDown = function (e) { report('press', mouse_event(e)); return true; };
//     this.mouseUp = function (e) { report('release', mouse_event(e)); return true; };
//     this.mouseMove = function (e) { report('move', mouse_event(e)); return true; };
//     this.mouseEnter = function (e) { report('enter', mouse_event(e)); return true; };
//     this.mouseLeave = function (e) { report('leave', mouse_event(e)); return true; };
//     this.mouseWheel = function (e) { report('wheel', wheel_event(e)); return true; };
//     // elmt.on('dragstart',function() {return false;});
//     // elmt.on('mousewheel', function(e){report('wheel',wheel_event($(this),e)); return false;});

//     let m_element = null;
//     let m_handlers = {
//         press: [], release: [], move: [], enter: [], leave: [], wheel: [], drag: [], drag_release: []
//     };
//     let m_dragging = false;
//     let m_drag_anchor = null;
//     let m_drag_pos = null;
//     let m_drag_rect = null;
//     let m_last_report_drag = new Date();
//     let m_scheduled_report_drag_X = null;

//     function report(name, X) {
//         if (name === 'drag') {
//             let elapsed = (new Date()) - m_last_report_drag;
//             if (elapsed < 50) {
//                 schedule_report_drag(X, 50 - elapsed + 10);
//                 return;
//             }
//             m_last_report_drag = new Date();
//         }
//         for (let i in m_handlers[name]) {
//             m_handlers[name][i](X);
//         }
//         drag_functionality(name, X);
//     }

//     function schedule_report_drag(X, timeout) {
//         if (m_scheduled_report_drag_X) {
//             m_scheduled_report_drag_X = X;
//             return;
//         }
//         else {
//             m_scheduled_report_drag_X = X;
//             setTimeout(() => {
//                 let X2 = m_scheduled_report_drag_X;
//                 m_scheduled_report_drag_X = null;
//                 report('drag', X2);
//             }, timeout)
//         }

//     }

//     function drag_functionality(name, X) {
//         if (name === 'press') {
//             m_dragging = false;
//             m_drag_anchor = cloneSimpleArray(X.pos);
//             m_drag_pos = null;
//         }
//         else if (name === 'release') {
//             if (m_dragging) {
//                 report('drag_release', { anchor: cloneSimpleArray(m_drag_anchor), pos: cloneSimpleArray(m_drag_pos), rect: cloneSimpleArray(m_drag_rect) });
//             }
//             m_dragging = false;
//         }
//         if ((name === 'move') && (X.buttons === 1)) {
//             // move with left button
//             if (m_dragging) {
//                 m_drag_pos = cloneSimpleArray(X.pos);
//             }
//             else {
//                 if (!m_drag_anchor) {
//                     m_drag_anchor = cloneSimpleArray(X.pos);
//                 }
//                 const tol = 4;
//                 if ((Math.abs(X.pos[0] - m_drag_anchor[0]) > tol) || (Math.abs(X.pos[1] - m_drag_anchor[1]) > tol)) {
//                     m_dragging = true;
//                     m_drag_pos = cloneSimpleArray(X.pos);
//                 }
//             }
//             if (m_dragging) {
//                 m_drag_rect = [Math.min(m_drag_anchor[0], m_drag_pos[0]), Math.min(m_drag_anchor[1], m_drag_pos[1]), Math.abs(m_drag_pos[0] - m_drag_anchor[0]), Math.abs(m_drag_pos[1] - m_drag_anchor[1])];
//                 report('drag', { anchor: cloneSimpleArray(m_drag_anchor), pos: cloneSimpleArray(m_drag_pos), rect: cloneSimpleArray(m_drag_rect) });
//             }
//         }
//     }

//     function mouse_event(e) {
//         if (!m_element) return {};
//         //var parentOffset = $(this).parent().offset();
//         //var offset=m_element.offset(); //if you really just want the current element's offset
//         var rect = m_element.getBoundingClientRect();
//         window.m_element = m_element;
//         window.dbg_m_element = m_element;
//         window.dbg_e = e;
//         var posx = e.clientX - rect.x;
//         var posy = e.clientY - rect.y;
//         return {
//             pos: [posx, posy],
//             modifiers: { ctrlKey: e.ctrlKey, shiftKey: e.shiftKey },
//             buttons: e.buttons
//         };
//     }
//     function wheel_event(e) {
//         return {
//             delta: e.originalEvent.wheelDelta
//         };
//     }
// }

// // function clone(obj) {
// //     return JSON.parse(JSON.stringify(obj));
// // }

// function cloneSimpleArray(x) {
//     return x.slice(0);
// }

