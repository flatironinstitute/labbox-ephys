import React, { FunctionComponent } from 'react'

interface Props {
    width: number
    height: number
    top: number
    onZoomIn: () => void
    onZoomOut: () => void
    onShiftTimeLeft: () => void
    onShiftTimeRight: () => void
    customActions: any[]
}

const TimeWidgetToolbarNew: FunctionComponent<Props> = (props) => {
    return (
        <div>Toolbar</div>
    )
}

export default TimeWidgetToolbarNew