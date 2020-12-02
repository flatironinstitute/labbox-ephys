// LABBOX-EXTENSION: ElectrodeGeometryTest2

import React from 'react';
import { ExtensionContext } from '../../extension';
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

export function activate(context: ExtensionContext) {
    context.registerSortingView({
        name: 'ElectrodeGeometryTest2',
        label: 'Electrode geometry test 2',
        component: ElectrodeGeometryTest2
    })
}