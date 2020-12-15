import React, { FunctionComponent, useState } from 'react';
import ElectrodeGeometryWidget from "../../electrodegeometry/ElectrodeGeometryWidget/ElectrodeGeometryWidget";
import { RecordingInfo } from "../../extensionInterface";


interface Props {
    recordingInfo: RecordingInfo
    width: number
    height: number
    selectedElectrodeIds?: number[]
    onSelectedElectrodeIdsChanged?: (s: number[]) => void
}

const ElectrodeGeometryView: FunctionComponent<Props> = ({recordingInfo, width, height, selectedElectrodeIds, onSelectedElectrodeIdsChanged}) => {
    const ri = recordingInfo
    const electrodes = ri ? zipElectrodes(ri.geom, ri.channel_ids) : []
    const [internalSelectedElectrodeIds, setInternalSelectedElectrodeIds] = useState<number[]>([]);
    if (!ri) {
        return (
            <div>No recording info found for recording.</div>
        )
    }
    return (
        <ElectrodeGeometryWidget
            electrodes={electrodes}
            selectedElectrodeIds={selectedElectrodeIds ? selectedElectrodeIds : internalSelectedElectrodeIds}
            onSelectedElectrodeIdsChanged={(x) => {
                if (selectedElectrodeIds) {
                    if (onSelectedElectrodeIdsChanged) onSelectedElectrodeIdsChanged(x);
                }
                else {
                    setInternalSelectedElectrodeIds(x)
                }
            }}
            width={width}
            height={height}
        />
    );
}

const zipElectrodes = (locations: number[][], ids: number[]) => {
    if (locations && ids && ids.length !== locations.length) throw Error('Electrode ID count does not match location count.')
    return ids.map((x, index) => {
        const loc = locations[index]
        return { label: x + '', x: loc[0], y: loc[1] }
    })
}

export default ElectrodeGeometryView