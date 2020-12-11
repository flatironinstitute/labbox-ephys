import React, { FunctionComponent, ReactElement, useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

interface Props {
    width: number
    height: number
    initialPosition: number
    onChange?: (newPosition: number) => void
    gripWidth?: number
    gripInnerWidth?: number
    gripMargin?: number
}

const Splitter: FunctionComponent<Props> = (props) => {
    const { width, height, initialPosition, onChange } = props

    const [gripPosition, setGripPosition] = useState<number>(initialPosition)

    if (!props.children) throw Error('Unexpected: no props.children')

    if (!Array.isArray(props.children)) {
        let child0: ReactElement = props.children as any as ReactElement
        return <child0.type {...child0.props} width={width} height={height} />
    }
    let child1 = props.children[0] as any as ReactElement
    let child2 = props.children[1] as any as ReactElement

    const gripWidth = props.gripWidth ?? 12
    const gripInnerWidth = props.gripInnerWidth ?? 4
    const gripMargin = props.gripMargin ?? 8
    const width1 = gripPosition - gripWidth / 2 - gripMargin
    const width2 = width - width1 - gripWidth - 2 * gripMargin;

    let style0: React.CSSProperties = {
        top: 0,
        left: 0,
        width: width,
        height: height
    };
    let style1: React.CSSProperties = {
        left: 0,
        top: 0,
        width: width1,
        height: height,
        zIndex: 0,
        overflowY: 'auto',
        overflowX: 'hidden'
    };
    let style2: React.CSSProperties = {
        left: width1 + gripWidth + 2 * gripMargin,
        top: 0,
        width: width2,
        height: height,
        zIndex: 0,
        overflowY: 'auto',
        overflowX: 'hidden'
    };
    let styleGripOuter: React.CSSProperties = {
        left: 0,
        top: 0,
        width: gripWidth + 2 * gripMargin,
        height: height,
        backgroundColor: 'transparent',
        cursor: 'col-resize',
        zIndex: 9999
    };
    let styleGrip: React.CSSProperties = {
        left: gripMargin,
        top: 0,
        width: gripWidth,
        height: height,
        background: 'rgb(230, 230, 230)',
        cursor: 'col-resize'
    };
    let styleGripInner: React.CSSProperties = {
        top: 0,
        left: (gripWidth - gripInnerWidth) / 2,
        width: gripInnerWidth,
        height: height,
        background: 'gray',
        cursor: 'col-resize'
    };
    const _handleGripDrag = (evt: DraggableEvent, ui: DraggableData) => {
    }
    const _handleGripDragStop = (evt: DraggableEvent, ui: DraggableData) => {
        const newGripPosition = ui.x;
        if (newGripPosition === gripPosition) {
            return;
        }
        setGripPosition(newGripPosition)
        onChange && onChange(newGripPosition)
    }
    return (
        <div className="splitter" style={{...style0, position: 'relative'}}>
            <div key="child1" style={{...style1, position: 'absolute'}} className="SplitterChild">
                <child1.type {...child1.props} width={width1} height={height} />
            </div>
            <Draggable
                key="drag"
                position={{ x: gripPosition - gripWidth / 2 - gripMargin, y: 0 }}
                axis="x"
                onDrag={(evt: DraggableEvent, ui: DraggableData) => _handleGripDrag(evt, ui)}
                onStop={(evt: DraggableEvent, ui: DraggableData) => _handleGripDragStop(evt, ui)}
            >
                <div style={{...styleGripOuter, position: 'absolute'}}>
                    <div style={{...styleGrip, position: 'absolute'}}>
                        <div style={{...styleGripInner, position: 'absolute'}} />
                    </div>
                </div>
            </Draggable>

            <div key="child2" style={{...style2, position: 'absolute'}} className="SplitterChild">
                <child2.type {...child2.props} width={width2} height={height} />
            </div>
        </div>
    )
}

export default Splitter