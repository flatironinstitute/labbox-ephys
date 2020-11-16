import { CanvasPainter, Context2D } from './CanvasPainter'
import { getBasePixelTransformationMatrix, getInverseTransformationMatrix, pointInRect, RectangularRegion, rectangularRegionsIntersect, TransformationMatrix, transformPoint, transformRect, transformXY, Vec2 } from './Geometry'

type OnPaint<T extends BaseLayerProps, T2 extends object> = (painter: CanvasPainter, layerProps: T, state: T2) => void
type OnPropsChange<T extends BaseLayerProps> = (layer: CanvasWidgetLayer<T, any>, layerProps: T) => void

export interface BaseLayerProps {
    width: number;
    height: number;
    [key: string]: any
}

// Events-handling stuff should probably go somewhere else
export interface ClickEvent {
    point: Vec2,
    mouseButton: number,
    modifiers: ClickEventModifiers,
    type: ClickEventType
}

export interface ClickEventModifiers {
    alt?: boolean,
    ctrl?: boolean,
    shift?: boolean
}

export enum ClickEventType {
    Move = 'MOVE',
    Press = 'PRESS',
    Release = 'RELEASE'
    // TODO: Wheel, etc?
}
export type ClickEventTypeStrings = keyof typeof ClickEventType

// These two handlers, and the EventHandlerSet, could all instead have parameterized types.
// But I couldn't figure out how to make the inheritance work right, so I bagged it.
// Reader, know that the layer in question ought to be a self-reference for the layer that owns the handler:
// this allows the handler functions to modify the parent function state without having direct reference
// to values outside their own scope.
export type DiscreteMouseEventHandler = (event: ClickEvent, layer: CanvasWidgetLayer<any, any>) => void
export type DragHandler = (layer: CanvasWidgetLayer<any, any>,  dragRect: RectangularRegion, released: boolean, anchor?: Vec2, position?: Vec2) => void

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
    const modifiers = {
        alt: e.altKey,
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
    }
    return {point: [point[0], point[1]], mouseButton: e.buttons, modifiers: modifiers, type: t}
}

export class CanvasWidgetLayer<LayerProps extends BaseLayerProps, State extends object> {
    #onPaint: OnPaint<LayerProps, State>
    #onPropsChange: OnPropsChange<LayerProps>

    #props: LayerProps | null
    #state: State | null

    #pixelWidth: number // TODO: Do we actually need these? Once the matrices and coord range have been set?
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

    constructor(onPaint: OnPaint<LayerProps, State>, onPropsChange: OnPropsChange<LayerProps>, handlers?: EventHandlerSet) {
        this.#state = null
        this.#props = null
        this.#onPaint = onPaint
        this.#onPropsChange = onPropsChange
        this.#discreteMouseEventHandlers = handlers?.discreteMouseEventHandlers || []
        this.#dragHandlers = handlers?.dragHandlers || []
        this.#pixelWidth = -1
        this.#pixelHeight = -1
        this.#coordRange = {xmin: 0, ymin: 0, xmax: 1, ymax: 1}
        this.#transformMatrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]] as any as TransformationMatrix
        this.#inverseMatrix = this.#transformMatrix
    }
    setBasePixelTransformationMatrix(system?: RectangularRegion) {
        const {matrix, coords} = getBasePixelTransformationMatrix(this.#pixelWidth, this.#pixelHeight, system)
        this.#coordRange = coords
        this.#transformMatrix = matrix
        this.#inverseMatrix = getInverseTransformationMatrix(matrix)
    }
    getProps() {    // TODO: Probably delete this?
        return this.#props ? this.#props : {} as BaseLayerProps
    }
    updateProps(p: LayerProps) { // this should only be called by the CanvasWidget which owns the Layer.
        console.log('Doing updateProps for a layer (but I do not know my own name).')
        this.#props = p
        this.#pixelWidth = p.width
        this.#pixelHeight = p.height
        this.#onPropsChange(this, p)
        console.log('Completed props update.')
    }
    getState() {
        return this.#state ? this.#state : {} as State
    }
    setState(s: State) {
        this.#state = s
    }
    // TODO: Should probably get rid of this?
    getTransformMatrix() {
        return this.#transformMatrix
    }
    // TODO: Should definitely get rid of this & replace with an update method
    setTransformMatrix(t: TransformationMatrix) {
        this.#transformMatrix = t
        this.#inverseMatrix = getInverseTransformationMatrix(t)
    }
    // TODO: Should probably get rid of this?
    getCoordRange() {
        return this.#coordRange
    }
    // TODO: Again should definitely be computed as part of an update method on transform matrix
    setCoordRange(r: RectangularRegion) {
        this.#coordRange = r
    }
    clipToSelf() {
        // TODO: Set this up so that it sets a bounding clip box on the Layer's full coordinate range
        return;
    }
    unclipToSelf(ctx: Context2D) { // Gets called at the end of _doRepaint().
        ctx.restore()
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
    resetCanvasElement(canvasElement: any) {
        this.#canvasElement = canvasElement
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
    _doRepaint = () => {
        console.log('Commencing repaint.')
        this.#lastRepaintTimestamp = Number(new Date())

        console.log('Context check')
        const ctx: Context2D | null = this.#canvasElement?.getContext('2d')
        if (!ctx) {
            this.#repaintNeeded = true
            return
        }
        console.log('Context check completed.')
        this.#repaintNeeded = false
        let painter = new CanvasPainter(ctx, this.#coordRange, this.#transformMatrix)
        painter.clear()
        console.log('Calling #onPaint.')
        this.#onPaint(painter, this.#props as LayerProps, this.#state as State)
        console.log('Unclipping.')
        this.unclipToSelf(ctx)
        console.log('Completed dorepaint call..')
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