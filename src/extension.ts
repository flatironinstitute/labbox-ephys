import { Dispatch } from "react"
import CalculationPool from "./extensions/common/CalculationPool"
import { ExtensionsConfig } from './extensions/reducers'
import { RootAction } from "./reducers"
import { DocumentInfo } from './reducers/documentInfo'
import { RegisterRecordingViewAction, RegisterSortingUnitMetricAction, RegisterSortingUnitViewAction, RegisterSortingViewAction } from './reducers/extensionContext'
import { Recording } from "./reducers/recordings"
import { Sorting } from "./reducers/sortings"

interface Plugin {
    name: string
    label: string
    priority?: number
    disabled?: boolean
}

interface ViewPlugin extends Plugin {
    props?: {[key: string]: any}
    fullWidth?: boolean
    defaultExpanded?: boolean
}

interface MetricPlugin extends Plugin {
    
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

export class ExtensionContext {
    constructor(private dispatch: Dispatch<RootAction>) {
    }
    registerSortingView(V: SortingViewPlugin) {
        const a: RegisterSortingViewAction = {
            type: 'REGISTER_SORTING_VIEW',
            sortingView: V
        }
        this.dispatch(a)
    }
    unregisterSortingView(name: string) {
        // todo
    }
    registerSortingUnitView(V: SortingUnitViewPlugin) {
        const a: RegisterSortingUnitViewAction = {
            type: 'REGISTER_SORTING_UNIT_VIEW',
            sortingUnitView: V
        }
        this.dispatch(a)
    }
    unregisterSortingUnitView(name: string) {
        // todo
    }
    registerRecordingView(V: RecordingViewPlugin) {
        const a: RegisterRecordingViewAction = {
            type: 'REGISTER_RECORDING_VIEW',
            recordingView: V
        }
        this.dispatch(a)
    }
    unregisterRecordingView(name: string) {
        // todo
    }
    registerSortingUnitMetric(M: SortingUnitMetricPlugin) {
        const a: RegisterSortingUnitMetricAction = {
            type: 'REGISTER_SORTING_UNIT_METRIC',
            sortingUnitMetric: M
        }
        this.dispatch(a)
    }
    unregisterSortingUnitMetric(name: string) {
        // todo
    }
}