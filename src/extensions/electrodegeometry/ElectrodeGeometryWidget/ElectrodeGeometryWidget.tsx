import React from "react"
import CanvasWidget from '../../common/CanvasWidget/CanvasWidget'
import { useLayer, useLayers } from "../../common/CanvasWidget/CanvasWidgetLayer"
import { Electrode } from "../../devel/ElectrodeGeometryTest/ElectrodeGeometry"
import { createElectrodeGeometryLayer, ElectrodeLayerProps } from './electrodeGeometryLayer'

// Okay, so after some hoop-jumping, we've learned the RecordingInfo has:
// - sampling frequency (number), - channel_ids (list of number),
// - channel_groups (list of number), - geom (list of Vec2),
// - num_frames (number), - is_local (boolean).

interface WidgetProps {
    electrodes: Electrode[] // Note: these shouldn't be interacted with directly. Use the bounding boxes in the state, instead.
    selectedElectrodeIds: number[]
    onSelectedElectrodeIdsChanged: (x: number[]) => void
    width: number
    height: number
}

const ElectrodeGeometryCanvas = (props: ElectrodeLayerProps) => {
    const layer = useLayer(createElectrodeGeometryLayer, props)
    const layers = useLayers([layer])
    return (
        <CanvasWidget
            key='electrodeGeometryCanvas'
            layers={layers}
            {...{width: props.width, height: props.height}}
        />
    )
}


// Widget proper: just a Sizeme wrapper.
const ElectrodeGeometryWidget = (props: WidgetProps) => {
    return (
        <ElectrodeGeometryCanvas 
            {...props}
        />
    )
}

export default ElectrodeGeometryWidget