import React from 'react';
import ElectrodeGeometry from './ElectrodeGeometry2';

interface Props {
}

const ElectrodeGeometryTest2 = (props: Props) => {
    const electrodes = [[20, 20], [40, 40], [60, 100], [80, 120]].map((coords, ii) => ({
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

const label = 'Electrode geometry test 2'

ElectrodeGeometryTest2.sortingViewPlugin = {
    label: label
}

export default ElectrodeGeometryTest2