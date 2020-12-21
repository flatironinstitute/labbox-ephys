
// LABBOX-EXTENSION: devel
// LABBOX-EXTENSION-TAGS: jupyter

import { ExtensionContext } from "../extensionInterface";
import ElectrodeGeometryTest from './ElectrodeGeometryTest/ElectrodeGeometryTest';
import IndividualUnits from "./IndividualUnits/IndividualUnits";
import RawRecordingView from "./RawViews/RawRecordingView";
import RawSortingView from "./RawViews/RawSortingView";

export function activate(context: ExtensionContext) {
    context.registerSortingView({
        name: 'ElectrodeGeometryTest',
        label: 'Electrode geometry test',
        development: true,
        component: ElectrodeGeometryTest,
        singleton: true
    })

    context.registerSortingView({
        name: 'IndividualUnits',
        label: 'Individual Units',
        development: true,
        priority: 70,
        component: IndividualUnits
    })

    context.registerSortingView({
        name: 'RawSortingView',
        label: 'Raw sorting object',
        priority: -10,
        component: RawSortingView,
        singleton: true
    })

    context.registerSortingView({
        name: 'RawRecordingView',
        label: 'Raw recording object',
        priority: -10,
        component: RawRecordingView,
        singleton: true
    })
}