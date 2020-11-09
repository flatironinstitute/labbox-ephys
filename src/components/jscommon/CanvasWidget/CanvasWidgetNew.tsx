import React, { useCallback, useEffect, useReducer } from 'react'
import { CanvasWidgetLayer, ClickEventFromMouseEvent, EventTypeFromString } from './CanvasWidgetLayer'
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
    layers: CanvasWidgetLayer<any>[],
    width: number,
    height: number,
    // Might choose to delete these hooks. Maybe it could be useful to have an action for the Widget itself, but
    // generally the Layer should be handling most of the responsibility here.
    onMouseMove?: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => void
    onMousePress?: (pos: Vec2) => void
    onMouseRelease?: (pos: Vec2) => void
    onMouseDrag?: (args: {anchor?: Vec2, pos?: Vec2, rect?: Vec4}) => void
    onMouseDragRelease?: (args: {anchor: Vec2, pos: Vec2, rect: Vec4}) => void
}

const CanvasWidget = (props: Props) => {
    const divRef = React.useRef<HTMLDivElement>(null)
    const [state, dispatch] = useReducer(dragReducer, {
        dragging: false,
        dragAnchor: undefined,
        dragPosition: undefined,
        dragRect: undefined
    })

    useEffect(() => {
        // this is only needed if the previous repaint occurred before the canvas element was rendered to the browser
        props.layers.forEach((L, index) => {
            // /// TODO: figure out what to do here
            // console.log(`I am layer ${index} and my props were ${JSON.stringify(props)}`)
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

    const _dispatchDiscreteMouseEvents = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, type: string) => {
        for (let l of props.layers) {
            l.handleDiscreteEvent(e, EventTypeFromString(type))
        }
    }, [props.layers])

    const _handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const { point, mouseButton } = ClickEventFromMouseEvent(e, EventTypeFromString('Move'))
        dispatch({type: COMPUTE_DRAG, mouseButton: mouseButton === 1, point: point})
        _dispatchDragEvents(false)
        _dispatchDiscreteMouseEvents(e, "Move")
    }, [_dispatchDragEvents, _dispatchDiscreteMouseEvents])

    const _handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const elmt = e.currentTarget
        const pos: Vec2 = [
            e.clientX - elmt.getBoundingClientRect().x,
            e.clientY - elmt.getBoundingClientRect().y
        ]
        _dispatchDiscreteMouseEvents(e, "Press")
        dispatch({ type: COMPUTE_DRAG, mouseButton: true, point: pos })
    }, [_dispatchDiscreteMouseEvents])

    const _handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        _dispatchDiscreteMouseEvents(e, "Release")
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