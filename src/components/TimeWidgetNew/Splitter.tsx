import React, { FunctionComponent, ReactElement, useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

interface Props {
    width: number
    height: number
    left: number
    onChange: () => void
}



const Splitter: FunctionComponent<Props> = (props) => {
    const { width, height, left, onChange } = props

    const [gripPosition, setGripPosition] = useState<number | null>(null)

    if (!props.children) throw Error('Unexpected: no props.children')

    if (!Array.isArray(props.children)) {
        let child0: ReactElement = props.children as any as ReactElement
        return <child0.type {...child0.props} width={width} height={height} left={left} />
    }
    let child1 = props.children[0] as any as ReactElement
    let child2 = props.children[1] as any as ReactElement

    const gp = gripPosition === null ? 300 : gripPosition
    const gripWidth = 12;
    const width1 = gp
    const width2 = width - width1 - gripWidth;

    let style0 = {
        top: 0,
        left: left,
        width: width,
        height: height
    };
    let style1 = {
        left: 0,
        top: 0,
        width: width1,
        height: height
    };
    let style2 = {
        left: width1 + gripWidth,
        top: 0,
        width: width2,
        height: height
    };
    let styleGrip = {
        top: 0,
        width: gripWidth,
        height: height,
        background: 'rgb(230, 230, 230)',
        cursor: 'col-resize',
        zIndex: 100
    };
    let styleGripInner = {
        top: 0,
        left: 0,
        width: 4,
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
        onChange && onChange()
    }
    return (
        <div style={{position: 'absolute', ...style0}}>
            <div key="child1" style={style1} className="SplitterChild">
                <child1.type {...child1.props} width={width1} height={height} />
            </div>
            <Draggable
                key="drag"
                position={{ x: gp, y: 0 }}
                axis="x"
                onDrag={(evt: DraggableEvent, ui: DraggableData) => _handleGripDrag(evt, ui)}
                onStop={(evt: DraggableEvent, ui: DraggableData) => _handleGripDragStop(evt, ui)}
            >
                <div style={styleGrip}>
                    <div style={styleGripInner} />
                </div>
            </Draggable>

            <div key="child2" style={style2} className="SplitterChild">
                <child2.type {...child2.props} width={width2} height={height} />
            </div>
        </div>
    )
}

export default Splitter