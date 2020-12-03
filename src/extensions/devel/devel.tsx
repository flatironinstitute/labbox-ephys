
// LABBOX-EXTENSION: devel

import { ExtensionContext } from "../../extension";
import ElectrodeGeometryTest from './ElectrodeGeometryTest/ElectrodeGeometryTest';
import IndividualUnits from "./IndividualUnits/IndividualUnits";
import RawSortingView from "./RawViews/RawSortingView";

export function activate(context: ExtensionContext) {
    context.registerSortingView({
        name: 'ElectrodeGeometryTest',
        label: 'Electrode geometry test',
        component: ElectrodeGeometryTest
    })

    context.registerSortingView({
        name: 'IndividualUnits',
        label: 'Individual Units',
        priority: 70,
        component: IndividualUnits
    })

    context.registerSortingView({
        name: 'RawSortingView',
        label: 'Raw sorting object',
        priority: -10,
        component: RawSortingView
    })
}