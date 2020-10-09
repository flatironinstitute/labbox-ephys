import React, { useEffect, useState } from 'react'
import { CanvasPainter, isNumber, isVec2, Vec2, Vec4 } from './CanvasPainter'

type OnPaint = (painter: CanvasPainter, layerProps: any) => void

export class CanvasWidgetLayer {
    #onPaint: OnPaint
    #preserveAspectRatio = false
    
    // these are set in _initialize
    #width: number = 100
    #height: number = 100 // todo: figure out how to get this
    #layerProps: any = {} // todo: figure out how to get this
    #canvasElement: any | null = null

    #margins: Vec4 = [0, 0, 0, 0]
    #coordXRange: Vec2 = [0, 1]
    #coordYRange: Vec2 = [0, 1]
    #repaintScheduled = false
    #lastRepaintTimestamp = Number(new Date())
    #repaintNeeded = false
    
    constructor(onPaint: OnPaint) {
        this.#onPaint = onPaint
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
        return [...this.#margins]
    }
    coordXRange() {
        if (!this.#preserveAspectRatio) {
            return [...this.#coordXRange];
        }
        else {
            // todo: replace margins by {left: , right: , top: , bottom: }
            let W = this.width() - this.margins()[0] - this.margins()[1]
            let H = this.height() - this.margins()[2] - this.margins()[3]
            let xSpan = this.#coordXRange[1] - this.#coordXRange[0]
            let ySpan = this.#coordYRange[1] - this.#coordYRange[0]
            let newXSpan = xSpan
            // let newYSpan = ySpan;
            if (W * ySpan < H * xSpan) {
                // newYSpan = H * xSpan / W;
            }
            else {
                newXSpan = W * ySpan / H;
            }
            let mid = (this.#coordXRange[0] + this.#coordXRange[1]) / 2
            return [mid - newXSpan / 2, mid + newXSpan/2]
        }
    }
    // TODO: merge these
    coordYRange() {
        if (!this.#preserveAspectRatio) {
            return [...this.#coordYRange]
        }
        else {
            let W = this.width() - this.margins()[0] - this.margins()[1]
            let H = this.height() - this.margins()[2] - this.margins()[3]
            let xSpan = this.#coordXRange[1] - this.#coordXRange[0]
            let ySpan = this.#coordYRange[1] - this.#coordYRange[0]
            // let newXSpan = xSpan;
            let newYSpan = ySpan
            if (W * ySpan < H * xSpan) {
                newYSpan = H * xSpan / W
            }
            else {
                // newXSpan = W * ySpan / H
            }
            let mid = (this.#coordYRange[0] + this.#coordYRange[1]) / 2
            return [mid - newYSpan / 2, mid + newYSpan/2];
        }
    }
    // TODO: merge these
    setCoordXRange(min: number | Vec2, max: number | undefined = undefined): void {
        if (isVec2(min)) {
            return this.setCoordXRange(min[0], min[1])
        }
        if (!isNumber(max)) throw Error('unexpected')
        this.#coordXRange = [min, max]
    }
    setCoordYRange(min: number | Vec2, max: number | undefined = undefined): void {
        if (isVec2(min)) {
            return this.setCoordYRange(min[0], min[1])
        }
        if (!isNumber(max)) throw Error('unexpected')
        this.#coordYRange = [min, max]
    }
    setPreserveAspectRatio(val: boolean) {
        this.#preserveAspectRatio = val
    }
    preserveAspectRatio() {
        return this.#preserveAspectRatio
    }
    pixToCoords(pix: Vec2): Vec2 {
        let margins = this.margins()
        let coordXRange = this.coordXRange()
        let coordYRange = this.coordYRange()
        let width = this.width()
        let height = this.height()
        let xpct = (pix[0] - margins[0]) / (width - margins[0] - margins[1])
        let x = coordXRange[0] + xpct * (coordXRange[1] - coordXRange[0])
        let ypct = (pix[1] - margins[2]) / (height - margins[2] - margins[3])
        let y = coordYRange[0] + (1 - ypct) * (coordYRange[1] - coordYRange[0])
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
        this.#margins = [l, r, t, b];
    }
    repaintImmediate() {
        this._doRepaint()
    }
    _initialize(width: number, height: number, layerProps: any, canvasElement: any) {
        this.#width = width
        this.#height = height
        this.#layerProps = layerProps
        this.#canvasElement = canvasElement
        this.scheduleRepaint()
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
        this.#onPaint(painter, this.#layerProps)
    }
}

interface Props {
    layers: CanvasWidgetLayer[],
    layerProps: any,
    width: number,
    height: number,
    onMouseMove: (pos: Vec2) => void
    onMousePress: (pos: Vec2) => void
    onMouseRelease: (pos: Vec2) => void
    onMouseDrag: (args: {anchor: Vec2, pos: Vec2, rect: Vec4}) => void
    onMouseDragRelease: (args: {anchor: Vec2, pos: Vec2, rect: Vec4}) => void
}

const CanvasWidget = (props: Props) => {
    const divRef = React.useRef<HTMLDivElement>(null)

    const [dragging, setDragging] = useState<boolean>(false)
    const [dragAnchor, setDragAnchor] = useState<Vec2 | null>(null)
    const [dragPosition, setDragPosition] = useState<Vec2 | null>(null)

    useEffect(() => {
        // this is only needed if the previous repaint occurred before the canvas element was rendered to the browser
        props.layers.forEach((L, index) => {
            /// todo: figure out what to do here
            const divElement = divRef.current
            if (divElement) {
                const canvasElement = divElement.children[index]
                L._initialize(props.width, props.height, props.layerProps, canvasElement)
                if (L.repaintNeeded()) {
                    L.scheduleRepaint()
                }
            }
        })
    })

    const _handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const elmt = e.currentTarget
        const pos: Vec2 = [
            e.clientX - elmt.getBoundingClientRect().x,
            e.clientY - elmt.getBoundingClientRect().y
        ]
        props.onMouseMove && props.onMouseMove(pos)

        if (e.buttons === 1) {
            let dragging0 = dragging
            let dragAnchor0 = dragAnchor
            let dragPosition0 = dragPosition
            if (!dragAnchor0) {
                dragAnchor0 = pos
                setDragAnchor(pos)
            }
            if (dragging) {
                dragPosition0 = pos
                setDragPosition(pos)
            }
            else {
                const tol = 4;
                if ((Math.abs(pos[0] - dragAnchor0[0]) > tol) || (Math.abs(pos[1] - dragAnchor0[1]) > tol)) {
                    dragging0 = true
                    setDragging(true)
                    dragPosition0 = pos
                    setDragPosition(pos)
                }
            }
            if ((dragging0) && (dragPosition0)) {
                const dragRect = [Math.min(dragAnchor0[0], dragPosition0[0]), Math.min(dragAnchor0[1], dragPosition0[1]), Math.abs(dragPosition0[0] - dragAnchor0[0]), Math.abs(dragPosition0[1] - dragPosition0[1])];
                props.onMouseDrag({ anchor: [...dragAnchor0], pos: [...dragPosition0], rect: [...dragRect] })
            }
        }
    }

    const _handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const elmt = e.currentTarget
        const pos: Vec2 = [
            e.clientX - elmt.getBoundingClientRect().x,
            e.clientY - elmt.getBoundingClientRect().y
        ]
        props.onMousePress && props.onMousePress(pos)
        setDragging(false)
        setDragAnchor(pos)
        setDragPosition(null)
    }

    const _handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const elmt = e.currentTarget
        const pos: Vec2 = [
            e.clientX - elmt.getBoundingClientRect().x,
            e.clientY - elmt.getBoundingClientRect().y
        ]
        props.onMouseRelease && props.onMouseRelease(pos)
        if ((dragging) && (dragAnchor) && (dragPosition)) {
            const dragRect = [Math.min(dragAnchor[0], dragPosition[0]), Math.min(dragAnchor[1], dragPosition[1]), Math.abs(dragPosition[0] - dragAnchor[0]), Math.abs(dragPosition[1] - dragPosition[1])];
            props.onMouseDragRelease && props.onMouseDragRelease({anchor: dragAnchor, pos: dragPosition, rect: dragRect})
        }
        setDragging(false)
    }

    const _handleMouseEnter = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const elmt = e.currentTarget
        const pos: Vec2 = [
            e.clientX - elmt.getBoundingClientRect().x,
            e.clientY - elmt.getBoundingClientRect().y
        ]
        // todo
    }

    const _handleMouseLeave = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const elmt = e.currentTarget
        const pos: Vec2 = [
            e.clientX - elmt.getBoundingClientRect().x,
            e.clientY - elmt.getBoundingClientRect().y
        ]
        // todo
    }
    
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