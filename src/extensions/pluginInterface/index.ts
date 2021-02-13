import { BasePlugin, CalculationPool, ExtensionContext } from "../labbox";
import { RecordingViewPlugin } from "./RecordingViewPlugin";
import { SortingUnitMetricPlugin } from "./SortingUnitMetricPlugin";
import { SortingUnitViewPlugin } from "./SortingUnitViewPlugin";
import { SortingViewPlugin } from "./SortingViewPlugin";

export type { ExternalSortingUnitMetric } from './exteneralUnitMetrics';
export type { Recording, RecordingInfo } from './Recording';
export { recordingSelectionReducer } from './RecordingSelection';
export type { RecordingSelection, RecordingSelectionAction, RecordingSelectionDispatch } from './RecordingSelection';
export type { RecordingViewPlugin, RecordingViewProps } from './RecordingViewPlugin';
export type { Sorting, SortingInfo } from './Sorting';
export { applyMergesToUnit, isMergeGroupRepresentative, mergeGroupForUnitId } from './SortingCuration';
export type { SortingCuration, SortingCurationDispatch } from './SortingCuration';
export { sortingSelectionReducer } from './SortingSelection';
export type { SortingSelection, SortingSelectionAction, SortingSelectionDispatch } from './SortingSelection';
export type { SortingUnitMetricPlugin } from './SortingUnitMetricPlugin';
export type { SortingUnitViewPlugin, SortingUnitViewProps } from './SortingUnitViewPlugin';
export type { SortingViewPlugin, SortingViewProps } from './SortingViewPlugin';

export interface BaseLabboxPlugin extends BasePlugin {
    priority?: number
    disabled?: boolean
    development?: boolean
}

export interface LabboxViewPlugin extends BaseLabboxPlugin {
    props?: {[key: string]: any}
    fullWidth?: boolean
    defaultExpanded?: boolean
    singleton?: boolean
}

export interface LabboxViewProps {
    plugins: LabboxPlugin
    calculationPool: CalculationPool
    width?: number
    height?: number
}

export const filterPlugins = (plugins: LabboxPlugin[]) => {
    return plugins.filter(p => ((!p.disabled) && (!p.development)))
}

export const sortingViewPlugins = (plugins: LabboxPlugin[]): SortingViewPlugin[] => {
    return plugins.filter(p => (p.type === 'SortingView'))
        .map(p => (p as any as SortingViewPlugin))
}

export const recordingViewPlugins = (plugins: LabboxPlugin[]): RecordingViewPlugin[] => {
    return plugins.filter(p => (p.type === 'RecordingView'))
        .map(p => (p as any as RecordingViewPlugin))
}

export const sortingUnitViewPlugins = (plugins: LabboxPlugin[]): SortingUnitViewPlugin[] => {
    return plugins.filter(p => (p.type === 'SortingUnitView'))
        .map(p => (p as any as SortingUnitViewPlugin))
}

export const sortingUnitMetricPlugins = (plugins: LabboxPlugin[]): SortingUnitMetricPlugin[] => {
    return plugins.filter(p => (p.type === 'SortingUnitMetric'))
        .map(p => (p as any as SortingUnitMetricPlugin))
}

export type LabboxPlugin = SortingViewPlugin | RecordingViewPlugin | SortingUnitViewPlugin | SortingUnitMetricPlugin

export type LabboxExtensionContext = ExtensionContext<LabboxPlugin>

