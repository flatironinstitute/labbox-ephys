import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { BaseLayerProps, CanvasWidgetLayer, ClickEventType, formClickEventFromMouseEvent, KeyEventType } from './CanvasWidgetLayer'
import { Vec2, Vec4 } from './Geometry'

// This class serves three purposes:
// 1. It collects & is a repository for the Layers that actually execute view and display output
// 2. It maintains drag/interaction state & dispatches user interactions back to the Layers
// 3. It creates and lays out the Canvas elements the Layers draw to.
// Essentially it's an interface between the browser and the Layer logic.

const COMPUTE_DRAG = 'COMPUTE_DRAG'
const END_DRAG = 'END_DRAG'

interface DragState {
    dragging: boolean, // whether we are in an active dragging state
    dragAnchor?: Vec2, // The position where dragging began (pixels)
    dragPosition?: Vec2, // The current drag position (pixels)
    dragRect?: Vec4, // The drag rect for convenience (pixels)
    shift?: boolean // whether the shift keys is being pressed
}

interface DragAction {
    type: 'COMPUTE_DRAG' | 'END_DRAG', // type of action
    mouseButton?: boolean, // whether the mouse is down
    point?: Vec2, // The position (pixels)
    shift?: boolean // Whether shift key is being pressed
}

const dragReducer = (state: DragState, action: DragAction): DragState => {
    let {dragging, dragAnchor } = state
    const {type, mouseButton, point, shift} = action

    switch (type) {
        case END_DRAG:
            // drag has ended (button released)
            return { dragging: false }
        case COMPUTE_DRAG:
            if (!mouseButton) return { // no button held; unset any drag state & return.
                dragging: false
            }
            if (!point) throw Error('Unexpected: no point')
            // with button, 4 cases: dragging yes/no and dragAnchor yes/no.
            // 0: dragging yes, dragAnchor no: this is invalid and throws an error.
            if (dragging && !dragAnchor) throw Error('Invalid state in computing drag: cannot have drag set with no dragAnchor.')
            // 1: dragging no, dragAnchor no: set dragAnchor to current position, and we're done.
            if (!dragging && !dragAnchor) return {
                dragging: false,
                dragAnchor: point,
                shift: shift || false
            }
            // 2: dragging no, dragAnchor yes: check if the mouse has moved past tolerance to see if we initiate dragging.
            if (!dragging && dragAnchor) {
                const tol = 4
                dragging = ((Math.abs(point[0] - dragAnchor[0]) > tol) || (Math.abs(point[1] - dragAnchor[1]) > tol))
                if (!dragging) return {
                    dragging: false,
                    dragAnchor: dragAnchor,
                    shift: shift || false
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
                            Math.abs(dragAnchor[1] - point[1]) ], //height
                shift: shift || false
            }
        break;
        default: {
            throw Error('Invalid mode for drag reducer.')
        }
    }
    throw Error('Unexpected: unreachable, but keeps ESLint happy')
}

interface Props<T extends BaseLayerProps> {
    layers: CanvasWidgetLayer<T, any>[], // the layers to paint (each corresponds to a canvas html element)
    preventDefaultWheel?: boolean // whether to prevent default behavior of mouse wheel
    layerProps: T // props sent to the layer
}

const CanvasWidget = <T extends BaseLayerProps>(props: Props<T>) => {
    const { layers, layerProps, preventDefaultWheel } = props

    // To learn about callback refs: https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
    const [divElement, setDivElement] = useState<HTMLDivElement | null>(null)
    const divRef = React.useCallback((elmt: HTMLDivElement) => {
        // this should get called only once after the div has been written to the DOM
        // we set this div element so that it can be used below when we set the canvas
        // elements to the layers
        setDivElement(elmt)
    }, [])

    useEffect(() => {
        // this should be called only when the divElement has been first set (above)
        // or when the layers (prop) has changed (or if preventDefaultWheel has changed)
        // we set the canvas elements on the layers and schedule repaints
        if (!divElement) return
        layers.forEach((L, i) => {
            const canvasElement = divElement.children[i]
            if (canvasElement) {
                if (preventDefaultWheel) {
                    canvasElement.addEventListener("wheel", (event) => {
                        event.preventDefault()
                    })
                }
                L.resetCanvasElement(canvasElement)
                L.scheduleRepaint()
            }
            else {
                console.warn('Unable to get canvas element for layer', i)
            }
        })
    }, [divElement, layers, preventDefaultWheel])

    // The drag state
    const [dragState, dispatchDrag] = useReducer(dragReducer, {
        dragging: false
    })

    const { width, height } = layerProps

    // set the layer props on the layers
    useEffect(() => {
        layers.forEach(L => {
            L.updateProps(layerProps)
        })
    }, [layerProps, layers])

    // schedule repaint when width or height change
    useEffect(() => {
        layers.forEach(L => {
            L.scheduleRepaint()
        })
    }, [width, height, layers])

    const [prevDragState, setPrevDragState] = useState<DragState | null>(null)

    // handle drag when dragState changes
    useEffect(() => {
        let ds: DragState | null = null
        if (dragState.dragging) {
            ds = dragState
        }
        else if ((prevDragState) && (prevDragState.dragging)) {
            ds = prevDragState
        }
        else {
            ds = null
        }
        if (ds) {
            const dragRect = ds.dragRect
            if (dragRect) {
                const pixelDragRect = {
                    xmin: dragRect[0],
                    xmax: dragRect[0] + dragRect[2],
                    ymin: dragRect[1] + dragRect[3],
                    ymax: dragRect[1]
                }
                for (let l of layers) {
                    l.handleDrag(pixelDragRect, !dragState.dragging, ds.shift, ds.dragAnchor, ds.dragPosition)
                }
            }
        }
        setPrevDragState(dragState)
    }, [dragState, prevDragState, setPrevDragState, layers])

    const _handleDiscreteMouseEvents = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, type: ClickEventType) => {
        for (let l of layers) {
            l.handleDiscreteEvent(e, type)
        }
    }, [layers])

    const _handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const { point, mouseButton, modifiers } = formClickEventFromMouseEvent(e, ClickEventType.Move)
        dispatchDrag({type: COMPUTE_DRAG, mouseButton: mouseButton === 1, point: point, shift: modifiers.shift || false})
        _handleDiscreteMouseEvents(e, ClickEventType.Move)
    }, [_handleDiscreteMouseEvents])

    const _handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const { point, modifiers } = formClickEventFromMouseEvent(e, ClickEventType.Press)
        _handleDiscreteMouseEvents(e, ClickEventType.Press)
        dispatchDrag({ type: COMPUTE_DRAG, mouseButton: true, point: point, shift: modifiers.shift || false})
    }, [_handleDiscreteMouseEvents])

    const _handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        _handleDiscreteMouseEvents(e, ClickEventType.Release)
        dispatchDrag({ type: END_DRAG })
    }, [_handleDiscreteMouseEvents, dispatchDrag])

    const _handleMouseEnter = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        // todo
    }, [])

    const _handleMouseLeave = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        // todo
    }, [])

    const _handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
        for (let l of layers) {
            l.handleWheelEvent(e)
        }
    }, [layers])

    const _handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        for (let l of layers) {
            if (l.handleKeyboardEvent(KeyEventType.Press, e) === false) {
                e.preventDefault()
            }
        }
    }, [layers])

    return (
        <div
            ref={divRef}
            style={{position: 'relative', width: layerProps.width, height: layerProps.height, left: 0, top: 0}}
            onKeyDown={_handleKeyPress}
            tabIndex={0} // tabindex needed to handle keypress
        >
            {
                layers.map((L, index) => (
                    <canvas
                        key={'canvas-' + index}
                        style={{position: 'absolute', left: 0, top: 0}}
                        width={layerProps.width}
                        height={layerProps.height}
                        onMouseMove={_handleMouseMove}
                        onMouseDown={_handleMouseDown}
                        onMouseUp={_handleMouseUp}
                        onMouseEnter={_handleMouseEnter}
                        onMouseLeave={_handleMouseLeave}
                        onWheel={_handleWheel}
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