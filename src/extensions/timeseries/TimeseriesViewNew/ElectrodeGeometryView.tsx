import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import ElectrodeGeometryWidget from "../../electrodegeometry/ElectrodeGeometryWidget/ElectrodeGeometryWidget";
import { RecordingInfo } from "../../extensionInterface";


interface Props {
    recordingInfo: RecordingInfo
    width: number
    height: number
    selectedElectrodeIds?: number[]
    visibleElectrodeIds: number[]
    onSelectedElectrodeIdsChanged?: (s: number[]) => void
}

const ElectrodeGeometryView: FunctionComponent<Props> = ({recordingInfo, width, height, selectedElectrodeIds, visibleElectrodeIds, onSelectedElectrodeIdsChanged}) => {
    const ri = recordingInfo
    const electrodes = useMemo(() => (ri ? zipElectrodes(ri.geom, ri.channel_ids) : []).filter(a => (visibleElectrodeIds.includes(a.id))), [ri, visibleElectrodeIds])
    const [internalSelectedElectrodeIds, setInternalSelectedElectrodeIds] = useState<number[]>([]);
    const handleSelectedElectrodeIdsChanged = useCallback((x: number[]) => {
        if (selectedElectrodeIds) {
            if (onSelectedElectrodeIdsChanged) onSelectedElectrodeIdsChanged(x);
        }
        else {
            setInternalSelectedElectrodeIds(x)
        }
    }, [selectedElectrodeIds, onSelectedElectrodeIdsChanged, setInternalSelectedElectrodeIds])
    if (!ri) {
        return (
            <div>No recording info found for recording.</div>
        )
    }
    return (
        <ElectrodeGeometryWidget
            electrodes={electrodes}
            selectedElectrodeIds={selectedElectrodeIds ? selectedElectrodeIds : internalSelectedElectrodeIds}
            onSelectedElectrodeIdsChanged={handleSelectedElectrodeIdsChanged}
            width={width}
            height={height}
        />
    );
}

const zipElectrodes = (locations: number[][], ids: number[]) => {
    if (locations && ids && ids.length !== locations.length) throw Error('Electrode ID count does not match location count.')
    return ids.map((x, index) => {
        const loc = locations[index]
        return { label: x + '', id: x, x: loc[0], y: loc[1] }
    })
}

export default ElectrodeGeometryView