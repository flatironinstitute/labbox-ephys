import React, { useCallback, useEffect, useReducer } from 'react'
import { BaseLayerProps, CanvasWidgetLayer, ClickEventFromMouseEvent, ClickEventType } from './CanvasWidgetLayer'
import { Vec2, Vec4 } from './Geometry'

// This class serves three purposes:
// 1. It collects & is a repository for the Layers that actually execute view and display output
// 2. It maintains drag/interaction state & dispatches user interactions back to the Layers
// 3. It creates and lays out the Canvas elements the Layers draw to.
// Essentially it's an interface between the browser and the Layer logic.

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
            return { ...state, dragging: false, dragAnchor: undefined, dragRect: undefined }
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

interface Props<T extends BaseLayerProps> {
    layers: CanvasWidgetLayer<T, any>[],
    widgetProps: T
}

const CanvasWidget = <T extends BaseLayerProps>(props: Props<T>) => {
    const divRef = React.useRef<HTMLDivElement>(null)
    const [state, dispatch] = useReducer(dragReducer, {
        dragging: false,
        dragAnchor: undefined,
        dragPosition: undefined,
        dragRect: undefined
    })

    useEffect(() => {
        console.log('Firing CanvasWidget useEffect()')
        // this is only needed if the previous repaint occurred before the canvas element was rendered to the browser
        props.layers.forEach((L, index) => {
            // /// TODO: figure out what to do here
            // console.log(`I am layer ${index} and my props were ${JSON.stringify(props)}`)
            const divElement = divRef.current
            if (divElement) {
                const canvasElement = divElement.children[index]
                L.resetCanvasElement(canvasElement)
                L.updateProps(props.widgetProps)
                L.scheduleRepaint() // The dependency list means this only gets called if props/canvas changed.
                // In those cases, we definitely need to repaint, so scheduling it should be safe.
            }
        })
    }, [props, divRef])

    const _dispatchDragEvents = useCallback((released: boolean) => {
        if (!state.dragRect) return
        const pixelDragRect = {
            xmin: state.dragRect[0],
            xmax: state.dragRect[0] + state.dragRect[2],
            ymin: state.dragRect[1] + state.dragRect[3],
            ymax: state.dragRect[1]
        }
        for (let l of props.layers) {
            l.handleDrag(pixelDragRect, released, state.dragAnchor, state.dragPosition)
        }
    }, [props.layers, state.dragAnchor, state.dragRect, state.dragPosition])

    const _dispatchDiscreteMouseEvents = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, type: ClickEventType) => {
        for (let l of props.layers) {
            l.handleDiscreteEvent(e, type)
        }
    }, [props.layers])

    const _handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const { point, mouseButton } = ClickEventFromMouseEvent(e, ClickEventType.Move)
        dispatch({type: COMPUTE_DRAG, mouseButton: mouseButton === 1, point: point})
        _dispatchDragEvents(false)
        _dispatchDiscreteMouseEvents(e, ClickEventType.Move)
    }, [_dispatchDragEvents, _dispatchDiscreteMouseEvents])

    const _handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const { point } = ClickEventFromMouseEvent(e, ClickEventType.Press)
        _dispatchDiscreteMouseEvents(e, ClickEventType.Press)
        dispatch({ type: COMPUTE_DRAG, mouseButton: true, point: point })
    }, [_dispatchDiscreteMouseEvents])

    const _handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        _dispatchDiscreteMouseEvents(e, ClickEventType.Release)
        if (state.dragging && state.dragAnchor && state.dragPosition && state.dragRect) {
            // No need to recompute the dragRect--we already computed it on mouse move
            _dispatchDragEvents(true)
        }
        dispatch({ type: END_DRAG, mouseButton: false, point: [0, 0] }) // resets drag rectangle. point is ignored.
    }, [state.dragging, state.dragAnchor, state.dragPosition, state.dragRect, _dispatchDragEvents, _dispatchDiscreteMouseEvents])

    const _handleMouseEnter = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        // todo
    }, [])

    const _handleMouseLeave = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        // todo
    }, [])
    // Similar for mousewheel, etc.

    return (
        <div
            ref={divRef}
            style={{position: 'relative', width: props.widgetProps.width, height: props.widgetProps.height, left: 0, top: 0}}
            // style={style0}
            // onKeyDown={(evt) => {this.props.onKeyPress && this.props.onKeyPress(evt);}}
            tabIndex={0} // tabindex needed to handle keypress
        >
            {
                props.layers.map((L, index) => (
                    <canvas
                        key={index}
                        style={{position: 'absolute', left: 0, top: 0}}
                        width={props.widgetProps.width}
                        height={props.widgetProps.height}
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