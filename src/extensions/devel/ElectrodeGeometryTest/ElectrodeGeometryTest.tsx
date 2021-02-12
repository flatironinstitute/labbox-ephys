import React from 'react';
import ElectrodeGeometry from './ElectrodeGeometry';

interface Props {
}

const ElectrodeGeometryTest = (props: Props) => {
    const electrodes = [[20, 20], [40, 40], [60, 100], [80, 120]].map((coords, ii) => ({
        id: ii,
        label: ii + '',
        x: coords[0],
        y: coords[1]         
    }));
    return (
        <ElectrodeGeometry
            electrodes={electrodes}
        />
    )
}

export default ElectrodeGeometryTest