import { CanvasPainter } from './CanvasPainter'
import { getBasePixelTransformationMatrix, getInverseTransformationMatrix, isRectangularRegion, isTransformationMatrix, pointInRect, RectangularRegion, rectangularRegionsIntersect, TransformationMatrix, transformPoint, transformRect, transformXY, Vec2 } from './Geometry'

type OnPaint = (painter: CanvasPainter, layerProps: any) => void

export interface BaseLayerProps {
    width: number;
    height: number;
    [key: string]: any
}

export interface DrawingSpaceProps {
    coordinateRange: RectangularRegion,
    transformationMatrix: TransformationMatrix,
    inverseMatrix: TransformationMatrix
}
export const isDrawingSpaceProps = (x: any): x is DrawingSpaceProps => {
    if (!x || typeof(x) !== 'object') return false
    for (let y of ['coordinateRange', 'transformationMatrix', 'inverseMatrix']) {
        if (!(y in x)) return false
    }
    return (isRectangularRegion(x.coordinateRange) &&
        isTransformationMatrix(x.transformationMatrix) && isTransformationMatrix(x.inverseMatrix))
}

export interface ClickEvent {
    point: Vec2,
    mouseButton: number,
    type: ClickEventType
}

// TODO: I'm sure there's a more elegant way of using types to implement enums in ts...
export type ClickEventType = 'Move' | 'Press' | 'Release'
export const EventTypeFromString = (x: string): ClickEventType => {
    switch(x) {
        case 'Move': return 'Move' as ClickEventType
        case 'Press': return 'Press' as ClickEventType
        case 'Release': return 'Release' as ClickEventType
        default: throw Error('Invalid click event type.')
    }
}

// These two handlers, and the EventHandlerSet, could all instead have parameterized types.
// But I couldn't figure out how to make the inheritance work right, so I bagged it.
// Reader, know that the layer in question ought to be a self-reference for the layer that owns the handler:
// this allows the handler functions to modify the parent function state without having direct reference
// to values outside their own scope.
export type DiscreteMouseEventHandler = (event: ClickEvent, layer: CanvasWidgetLayer<any>) => void
export type DragHandler = (layer: CanvasWidgetLayer<any>,  dragRect: RectangularRegion, released: boolean, anchor?: Vec2, position?: Vec2) => void

export interface EventHandlerSet {
    discreteMouseEventHandlers: DiscreteMouseEventHandler[],
    dragHandlers:   DragHandler[]
}

export const ClickEventFromMouseEvent = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, t: ClickEventType, i?: TransformationMatrix): ClickEvent => {
    const element = e.currentTarget
    let point: Vec2 = [e.clientX - element.getBoundingClientRect().x, e.clientY - element.getBoundingClientRect().y]
    if (i) {
        const pointH = transformXY(i, point[0], point[1])
        point = [pointH[0], pointH[1]]
    }
    return {point: [point[0], point[1]], mouseButton: e.buttons, type: t}
}

export class CanvasWidgetLayer<LayerProps extends BaseLayerProps> {
    #onPaint: OnPaint
    #props: LayerProps

    #pixelWidth: number
    #pixelHeight: number
    #canvasElement: any | null = null

    #coordRange: RectangularRegion
    #transformMatrix: TransformationMatrix
    #inverseMatrix: TransformationMatrix

    #repaintScheduled = false
    #lastRepaintTimestamp = Number(new Date())
    #repaintNeeded = false

    #discreteMouseEventHandlers: DiscreteMouseEventHandler[] = []
    #dragHandlers: DragHandler[] = []

    constructor(onPaint: OnPaint, initialProps: LayerProps, handlers?: EventHandlerSet) {
        this.#onPaint = onPaint
        this.#pixelWidth = initialProps.width
        this.#pixelHeight = initialProps.height
        this.#props = {...initialProps}
        this.#discreteMouseEventHandlers = []
        this.#dragHandlers = []
        if ('Transform' in initialProps) {
            if (!isDrawingSpaceProps(initialProps.Transform)) throw Error('LayerProps.Transform does not match DrawingSpaceProps interface')
            this.#coordRange = initialProps.Transform.coordinateRange
            this.#transformMatrix = initialProps.Transform.transformationMatrix
            this.#inverseMatrix = initialProps.Transform.inverseMatrix
        } else {
            const {matrix, coords} = getBasePixelTransformationMatrix(this.#pixelWidth, this.#pixelHeight)
            this.#coordRange = coords
            this.#transformMatrix = matrix
            this.#inverseMatrix = getInverseTransformationMatrix(matrix)
        }
        if (handlers) {
            this.#discreteMouseEventHandlers = handlers.discreteMouseEventHandlers || []
            this.#dragHandlers = handlers.dragHandlers || []
        }
    }
    getProps(): LayerProps {
        return {...this.#props}
    }
    setProps(p: LayerProps) {
        this.#props = {...p}
    }
    // I'm not sure this is a good idea...
    updateTransformAndCoordinateSystem(newTransformationMatrix: TransformationMatrix, newCoordinateSystem: RectangularRegion) {
        this.setTransformMatrix(newTransformationMatrix)
        this.setCoordRange(newCoordinateSystem)
    }
    getTransformMatrix() {
        return this.#transformMatrix
    }
    setTransformMatrix(t: TransformationMatrix) {
        this.#transformMatrix = t
        this.#inverseMatrix = getInverseTransformationMatrix(t)
    }
    getCoordRange() {
        return this.#coordRange
    }
    setCoordRange(r: RectangularRegion) {
        this.#coordRange = r
    }
    clipToSelf() {
        // TODO: Set this up so that it sets a bounding clip box on the Layer's full coordinate range
        return;
    }
    unclipToSelf() {
        // TODO: Whatever's needed here to remove the clipbox on the current Layer.
        // Gets called at the end of _doRepaint().
        return;
    }
    context() {
        if (!this.#canvasElement) return null
        return this.#canvasElement.getContext('2d')
    }
    canvasElement() {
        return this.#canvasElement
    }
    repaintNeeded() {
        return this.#repaintNeeded
    }
    pixelWidth() {
        return this.#pixelWidth
    }
    pixelHeight() {
        return this.#pixelHeight
    }
    
    scheduleRepaint() {
        this.#repaintNeeded = true
        if (this.#repaintScheduled) {
            return;
        }
        const elapsedSinceLastRepaint =  Number(new Date()) - this.#lastRepaintTimestamp
        if (elapsedSinceLastRepaint > 10) {
            // do it right away
            this._doRepaint();
            return;
        }
        this.#repaintScheduled = true;
        setTimeout(() => {
            // let elapsed = (new Date()) - timer;
            this.#repaintScheduled = false;
            this._doRepaint();
        }, 5);
    }
    repaintImmediate() {
        this._doRepaint()
    }
    _initialize(width: number, height: number, canvasElement: any) {
        const doScheduleRepaint = (
            (width !== this.#pixelWidth) ||
            (height !== this.#pixelHeight) ||
            canvasElement !== this.#canvasElement
        )
        this.#pixelWidth = width
        this.#pixelHeight = height
        this.#canvasElement = canvasElement
        // this.scheduleRepaint()
        if (doScheduleRepaint) {
            this.scheduleRepaint()
        }
    }
    _doRepaint = () => {
        this.#lastRepaintTimestamp = Number(new Date())

        let ctx = this.context()
        if (!ctx) {
            this.#repaintNeeded = true
            return
        }
        this.#repaintNeeded = false
        // this._mouseHandler.setElement(L.canvasElement());
        let painter = new CanvasPainter(ctx, this.#coordRange, this.#transformMatrix)
        painter.clear()
        this.#onPaint(painter, this.#props)
        this.unclipToSelf()
    }

    handleDiscreteEvent(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, type: ClickEventType) {
        if (this.#discreteMouseEventHandlers.length === 0) return
        const click = ClickEventFromMouseEvent(e, type, this.#inverseMatrix)
        // Don't respond to events outside the layer
        // NB possible minor efficiency gain if we cache our bounding coordinates in pixelspace.
        if (!pointInRect(click.point, this.#coordRange)) return
        for (let fn of this.#discreteMouseEventHandlers) {
            fn(click, this)
        }
    }

    handleDrag(pixelDragRect: RectangularRegion, released: boolean, pixelAnchor?: Vec2, pixelPosition?: Vec2) {
        if (this.#dragHandlers.length === 0) return
        const coordDragRect = transformRect(this.#inverseMatrix, pixelDragRect)
        if (!rectangularRegionsIntersect(coordDragRect, this.#coordRange)) return // short-circuit if event is nothing to do with us
        // Note: append a 1 to make the Vec2s into Vec2Hs
        const coordAnchor = pixelAnchor ? transformPoint(this.#inverseMatrix, [...pixelAnchor, 1]) : undefined
        const coordPosition = pixelPosition ? transformPoint(this.#inverseMatrix, [...pixelPosition, 1]) : undefined
        for (let fn of this.#dragHandlers) {
            fn(this, coordDragRect, released, coordAnchor, coordPosition)
        }
    }
}