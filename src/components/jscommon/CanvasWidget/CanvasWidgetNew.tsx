import React, { useCallback, useEffect, useReducer } from 'react'
import { CanvasPainter, RectBySides, RectOptionalSides, Vec2, Vec4 } from './CanvasPainter'

type OnPaint = (painter: CanvasPainter, layerProps: any) => void

export class CanvasWidgetLayer<LayerProps extends {[key: string]: any}> {
    #onPaint: OnPaint
    #props: LayerProps
    #preserveAspectRatio = false

    // these are set in _initialize
    #width: number = 100
    #height: number = 100 // todo: figure out how to get this
    #canvasElement: any | null = null

    #margins: RectBySides = { left: 0, right: 0, top: 0, bottom: 0 }
    #coordRange: RectBySides = { left: 0, right: 1, top: 0, bottom: 1 }

    #repaintScheduled = false
    #lastRepaintTimestamp = Number(new Date())
    #repaintNeeded = false

    constructor(onPaint: OnPaint, initialProps: LayerProps) {
        this.#onPaint = onPaint
        this.#props = {...initialProps}
    }
    setProps(p: LayerProps) {
        this.#props = {...p}
    }
    getProps(): LayerProps {
        return {...this.#props}
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
    width() {
        return this.#width
    }
    height() {
        return this.#height
    }
    margins() {
        return { ...this.#margins }
    }
    coordRange(): RectBySides {
        if (!this.#preserveAspectRatio) {
            return {...this.#coordRange}
        }
        const W = this.width() - this.margins().left - this.margins().right
        const H = this.height() - this.margins().top - this.margins().bottom
        const xSpan = this.#coordRange.right - this.#coordRange.left
        const ySpan = this.#coordRange.bottom - this.#coordRange.top
        let newXSpan = xSpan
        let newYSpan = ySpan
        // Now update either the x- or y-span so that W/H = X/Y
        // (Except we do WY = HX to avoid dealing with division)
        if (W * ySpan < H * xSpan) {
            newYSpan = H * xSpan / W
        } else {
            newXSpan = W * ySpan / H
        }
        const midX = (this.#coordRange.left + this.#coordRange.right) / 2
        const midY = (this.#coordRange.top + this.#coordRange.bottom) / 2
        return {left: midX - newXSpan / 2,  right: midX + newXSpan / 2,
                 top: midY - newYSpan / 2, bottom: midY + newYSpan / 2 }
    }
    setCoordRange(range: RectOptionalSides) : void {
        this.#coordRange = {...this.#coordRange, ...range}
        if ((this.#coordRange.left > this.#coordRange.right)
            || (this.#coordRange.top > this.#coordRange.bottom)) {
                throw Error(`Invalid coordinate range: negative width or height.\n${JSON.stringify(this.#coordRange)}`)
            }
    }
    setPreserveAspectRatio(val: boolean) {
        this.#preserveAspectRatio = val
    }
    preserveAspectRatio() {
        return this.#preserveAspectRatio
    }
    pixToCoords(pix: Vec2): Vec2 {
        const margins = this.margins()
        const {left, right, top, bottom} = this.coordRange()
        const contentWidth = this.width() - margins.left - margins.right
        const contentHeight = this.height() - margins.top - margins.bottom
        const xpct = (pix[0] - margins.left) / (contentWidth)
        const ypct = (pix[1] - margins.top) / (contentHeight)
        const x = left + xpct * (right - left)
        const y = top + (1 - ypct) * (bottom - top)
        return [x, y]
    }
    // ??????????????????
    // _canvasWidget() {
    //     return this._canvasWidget;
    // }
    // _setCanvasWidget(canvasWidget) {
    //     this._canvasWidget = canvasWidget;
    // }
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
    setMargins(l: number, r: number, t: number, b: number) {
        this.#margins = { left: l, right: r, top: t, bottom: b }
    }
    repaintImmediate() {
        this._doRepaint()
    }
    _initialize(width: number, height: number, canvasElement: any) {
        let doScheduleRepaint = (
            (width !== this.#width) ||
            (height !== this.#height) ||
            canvasElement !== this.#canvasElement
        )
        this.#width = width
        this.#height = height
        this.#canvasElement = canvasElement
        // this.scheduleRepaint()
        if (doScheduleRepaint) {
            this.scheduleRepaint()
        }
    }
    _doRepaint = () => {
        // for (let handler of this._repaintHandlers) {
        //     handler();
        // }
        this.#lastRepaintTimestamp = Number(new Date())

        let ctx = this.context()
        if (!ctx) {
            this.#repaintNeeded = true
            return
        }
        this.#repaintNeeded = false
        // this._mouseHandler.setElement(L.canvasElement());
        let painter = new CanvasPainter(ctx, this)
        // painter._initialize(this.props.width, this.props.height);
        painter.clear()
        console.log('--------------- props', this.#props)
        this.#onPaint(painter, this.#props)
    }
}

interface ClickEvent {
    point: Vec2,
    mouseButton: boolean
}

const _pointFromEvent = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>): ClickEvent => {
    const element = e.currentTarget
    const point: Vec2 = [
        e.clientX - element.getBoundingClientRect().x,
        e.clientY - element.getBoundingClientRect().y
    ]
    return { point: point, mouseButton: e.buttons === 1 }
}

const COMPUTE_DRAG = 'COMPUTE_DRAG'
const END_DRAG = 'END_DRAG'

interface DragState {
    dragging: boolean,
    dragAnchor?: Vec2,
    dragPosition?: Vec2,
    dragRect?: Vec4
}

interface DragAction {
    type: 'COMPUTE_DRAG' | 'END_DRAG',
    mouseButton: boolean,
    point: Vec2
}

const dragReducer = (state: DragState, action: DragAction): DragState => {
    let {dragging, dragAnchor } = state
    const {type, mouseButton, point} = action

    switch (type) {
        case END_DRAG:
            return { ...state, dragging: false, dragAnchor: undefined }
        case COMPUTE_DRAG:
            if (!mouseButton) return { // no button held; unset any drag state & return.
                dragging: false,
                dragAnchor: undefined
            }
            // with button, 4 cases: dragging yes/no and dragAnchor yes/no.
            // 0: dragging yes, dragAnchor no: this is invalid and throws an error.
            if (dragging && !dragAnchor) throw Error('Invalid state in computing drag: cannot have drag set with no dragAnchor.')
            // 1: dragging no, dragAnchor no: set dragAnchor to current position, and we're done.
            if (!dragging && !dragAnchor) return {
                dragging: false,
                dragAnchor: point,
            }
            // 2: dragging no, dragAnchor yes: check if the mouse has moved past tolerance to see if we initiate dragging.
            if (!dragging && dragAnchor) {
                const tol = 4
                dragging = ((Math.abs(point[0] - dragAnchor[0]) > tol) || (Math.abs(point[1] - dragAnchor[1]) > tol))
                if (!dragging) return {
                    dragging: false,
                    dragAnchor: dragAnchor
                }
            }
            // 3: dragging yes (or newly dragging), and dragAnchor yes. Compute point and rect, & return all.
            if (dragging && dragAnchor) return {
                dragging: true,
                dragAnchor: dragAnchor,
                dragPosition: point,
                dragRect: [ Math.min(dragAnchor[0],  point[0]), // x: upper left corner of rect, NOT the anchor
                            Math.min(dragAnchor[1],  point[1]), // y: upper left corner of rect, NOT the anchor
                            Math.abs(dragAnchor[0] - point[0]), // width
                            Math.abs(dragAnchor[1] - point[1]) ] //height
            }
        break;
        default: {
            throw Error('Invalid mode for drag reducer.')
        }
    }
    return { dragging: true } // unreachable, but keeps ESLint happy
}

interface Props {
    layers: CanvasWidgetLayer<{[key: string]: any}>[],
    width: number,
    height: number,
    onMouseMove: (pos: Vec2) => void
    onMousePress: (pos: Vec2) => void
    onMouseRelease: (pos: Vec2) => void
    onMouseDrag: (args: {anchor?: Vec2, pos?: Vec2, rect?: Vec4}) => void
    onMouseDragRelease: (args: {anchor: Vec2, pos: Vec2, rect: Vec4}) => void
}

const CanvasWidget = (props: Props) => {
    const divRef = React.useRef<HTMLDivElement>(null)

    const { onMouseDrag, onMousePress, onMouseRelease, onMouseDragRelease } = props

    const [state, dispatch] = useReducer(dragReducer, {
        dragging: false,
        dragAnchor: undefined,
        dragPosition: undefined,
        dragRect: undefined
    })

    useEffect(() => {
        // this is only needed if the previous repaint occurred before the canvas element was rendered to the browser
        props.layers.forEach((L, index) => {
            /// todo: figure out what to do here
            const divElement = divRef.current
            if (divElement) {
                const canvasElement = divElement.children[index]
                L._initialize(props.width, props.height, canvasElement)
                if (L.repaintNeeded()) {
                    L.scheduleRepaint()
                }
            }
        })
    })

    const _handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const { point, mouseButton } = _pointFromEvent(e)
        dispatch({type: COMPUTE_DRAG, mouseButton: mouseButton, point: point})
        onMouseDrag({ anchor: state.dragAnchor, pos: state.dragPosition, rect: state.dragRect })
    }, [onMouseDrag, state.dragAnchor, state.dragPosition, state.dragRect])

    const _handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const elmt = e.currentTarget
        const pos: Vec2 = [
            e.clientX - elmt.getBoundingClientRect().x,
            e.clientY - elmt.getBoundingClientRect().y
        ]
        onMousePress && onMousePress(pos)
        dispatch({ type: COMPUTE_DRAG, mouseButton: true, point: pos })
    }, [onMousePress])

    const _handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const { point } = _pointFromEvent(e)
        onMouseRelease && onMouseRelease(point)
        if (state.dragging && state.dragAnchor && state.dragPosition && state.dragRect) {
            // No need to recompute the dragRect--we already computed it on mouse move
            onMouseDragRelease && onMouseDragRelease({anchor: state.dragAnchor, pos: state.dragPosition, rect: state.dragRect})
        }
        dispatch({ type: END_DRAG, mouseButton: false, point: [0, 0] })
    }, [onMouseRelease, onMouseDragRelease, state.dragging, state.dragAnchor, state.dragPosition, state.dragRect])

    const _handleMouseEnter = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const { point } = _pointFromEvent(e)
        // todo
    }, [])

    const _handleMouseLeave = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const { point } = _pointFromEvent(e)
        // todo
    }, [])

    return (
        <div
            ref={divRef}
            style={{position: 'relative', width: props.width, height: props.height, left: 0, top: 0}}
            // style={style0}
            // onKeyDown={(evt) => {this.props.onKeyPress && this.props.onKeyPress(evt);}}
            tabIndex={0} // tabindex needed to handle keypress
        >
            {
                props.layers.map((L, index) => (
                    <canvas
                        key={index}
                        style={{position: 'absolute', left: 0, top: 0}}
                        width={props.width}
                        height={props.height}
                        onMouseMove={_handleMouseMove}
                        onMouseDown={_handleMouseDown}
                        onMouseUp={_handleMouseUp}
                        onMouseEnter={_handleMouseEnter}
                        onMouseLeave={_handleMouseLeave}
                    />
                ))
            }
            {/* {
                this.props.menuOpts ? (
                    <CanvasWidgetMenu visible={this.state.menuVisible}
                        menuOpts={this.props.menuOpts}
                        onExportSvg={this._exportSvg}
                    />
                ) : <span />
            } */}

        </div>
    )
}

export default CanvasWidget