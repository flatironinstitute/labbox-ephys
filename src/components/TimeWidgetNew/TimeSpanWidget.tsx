import React, { FunctionComponent } from 'react';


export interface SpanWidgetInfo {

}

interface Props {
    width: number
    height: number
    info: SpanWidgetInfo
    onCurrentTimeChanged: (t: number | null) => void
    onTimeRangeChanged: (tr: {min: number, max: number} | null) => void
}

const TimeSpanWidget: FunctionComponent<Props> = (props) => {
    return <div>Time span widget</div>
}

export default TimeSpanWidget