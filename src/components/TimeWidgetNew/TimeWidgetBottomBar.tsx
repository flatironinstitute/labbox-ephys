import React, { FunctionComponent } from 'react';


export interface BottomBarInfo {

}

interface Props {
    width: number
    height: number
    info: BottomBarInfo
    onCurrentTimeChanged: (t: number | null) => void
    onTimeRangeChanged: (tr: {min: number, max: number} | null) => void
}

const TimeWidgetBottomBar: FunctionComponent<Props> = (props) => {
    return <div>Time widget bottom bar</div>
}

export default TimeWidgetBottomBar