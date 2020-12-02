// LABBOX-EXTENSION: ElectrodeGeometryTest

import React from 'react';
import { ExtensionContext } from '../../extension';
import ElectrodeGeometry from './ElectrodeGeometry';

interface Props {
}

const ElectrodeGeometryTest = (props: Props) => {
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
        name: 'ElectrodeGeometryTest',
        label: 'Electrode geometry test',
        component: ElectrodeGeometryTest
    })
}