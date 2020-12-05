import CalculationPool from "./extensions/common/CalculationPool"
import { ExtensionsConfig } from './extensions/reducers'
import { DocumentInfo } from './reducers/documentInfo'
import { Recording } from "./reducers/recordings"
import { Sorting } from "./reducers/sortings"

export interface LabboxPlugin {
    name: string
    label: string
    priority?: number
    disabled?: boolean
}

export interface ViewPlugin extends LabboxPlugin {
    props?: {[key: string]: any}
    fullWidth?: boolean
    defaultExpanded?: boolean
}

export interface MetricPlugin extends LabboxPlugin {
    
}

export interface SortingViewProps {
    sorting: Sorting
    recording: Recording
    selectedUnitIds: {[key: string]: boolean}
    extensionsConfig: ExtensionsConfig
    focusedUnitId: number | null
    documentInfo: DocumentInfo
    onUnitClicked: (unitId: number, event: {ctrlKey?: boolean, shiftKey?: boolean}) => void
    onAddUnitLabel: (a: {
        sortingId: string;
        unitId: number;
        label: string;
    }) => void
    onRemoveUnitLabel: (a: {
        sortingId: string;
        unitId: number;
        label: string;
    }) => void
    onSelectedUnitIdsChanged: (selectedUnitIds: {[key: string]: boolean}) => void
    readOnly: boolean | null
    sortingUnitViews: {[key: string]: SortingUnitViewPlugin} // maybe this doesn't belong here
    sortingUnitMetrics: {[key: string]: SortingUnitMetricPlugin}
}

export interface SortingViewPlugin extends ViewPlugin {
    component: React.ComponentType<SortingViewProps>
}

export interface SortingUnitViewProps {
    sorting: Sorting
    recording: Recording
    unitId: number
    calculationPool: CalculationPool
    selectedSpikeIndex: number | null
    onSelectedSpikeIndexChanged: (index: number | null) => void
}

export interface SortingUnitViewPlugin extends ViewPlugin {
    component: React.ComponentType<SortingUnitViewProps>
}

export interface RecordingViewProps {
    recording: Recording
}

export interface RecordingViewPlugin extends ViewPlugin {
    component: React.ComponentType<RecordingViewProps>
}

export interface SortingUnitMetricPlugin extends MetricPlugin {
    columnLabel: string,
    tooltip: string,
    hitherFnName: string,
    metricFnParams: {[key: string]: any},
    hitherConfig: {
        auto_substitute_file_objects?: boolean,
        hither_config?: {
            use_job_cache: boolean
        },
        job_handler_name?: string
        wait?: boolean,
        useClientCache?: boolean,
        newHitherJobMethod?: boolean
    },
    component: React.FunctionComponent<{record: any}>
    getRecordValue: (record: any) => { 
        numericValue: number, 
        stringValue: string,
        isNumeric: boolean
    }
}

export interface ExtensionContext {
    registerSortingView: (V: SortingViewPlugin) => void
    unregisterSortingView: (name: string) => void
    registerSortingUnitView: (V: SortingUnitViewPlugin) => void
    unregisterSortingUnitView: (name: string) => void
    registerRecordingView: (V: RecordingViewPlugin) => void
    unregisterRecordingView: (name: string) => void
    registerSortingUnitMetric: (M: SortingUnitMetricPlugin) => void
    unregisterSortingUnitMetric: (name: string) => void
}