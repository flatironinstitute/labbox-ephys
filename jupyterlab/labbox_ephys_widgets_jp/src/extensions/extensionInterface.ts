import { Reducer } from "react"

export interface Sorting {
    sortingId: string
    sortingLabel: string
    sortingPath: string
    sortingObject: any
    recordingId: string
    recordingPath: string
    recordingObject: any
    externalUnitMetricsUri?: string

    sortingInfo?: SortingInfo
    externalUnitMetrics?: ExternalSortingUnitMetric[]
    curation?: SortingCuration
}

export type Label = string

export type ExternalSortingUnitMetric = {name: string, label: string, tooltip?: string, data: {[key: string]: number}}

export interface SortingInfo {
    unit_ids: number[]
    samplerate: number
}

export interface RecordingInfo {
    sampling_frequency: number
    channel_ids: number[]
    channel_groups: number[]
    geom: (number[])[]
    num_frames: number
    is_local?: boolean
}

export interface Recording {
    recordingId: string
    recordingLabel: string
    recordingObject: any
    recordingPath: string
    recordingInfo: RecordingInfo
    fetchingRecordingInfo?: boolean // internal
}

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

// Sorting curation
export type SortingCuration = {
    labelsByUnit: {[key: string]: string[]}
    labelChoices: string[]
}
export const defaultSortingCuration: SortingCuration = {
    labelChoices: ["accept", "reject", "mua", "artifact", "noise"].sort(),
    labelsByUnit: {}
}

export type SortingCurationDispatch = (action: SortingCurationAction) => void

type AddLabelSortingCurationAction = {
    type: 'AddLabel',
    unitId: number
    label: string
}

type RemoveLabelSortingCurationAction = {
    type: 'RemoveLabel',
    unitId: number
    label: string
}

export type SortingCurationAction = AddLabelSortingCurationAction | RemoveLabelSortingCurationAction

// This reducer is used by the jupyter widget, but not by the web gui. That's because the web gui uses the global redux state to dispatch the curation actions.
export const sortingCurationReducer: Reducer<SortingCuration, SortingCurationAction> = (state: SortingCuration, action: SortingCurationAction): SortingCuration => {
    if (action.type === 'AddLabel') {
        const uid = action.unitId + ''
        const labels = state.labelsByUnit[uid] || []
        if (!labels.includes(action.label)) {
            return {
                ...state,
                labelsByUnit: {
                    ...state.labelsByUnit,
                    [uid]: [...labels, action.label].sort()
                }
            }
        }
        else return state
    }
    else if (action.type === 'RemoveLabel') {
        const uid = action.unitId + ''
        const labels = state.labelsByUnit[uid] || []
        if (labels.includes(action.label)) {
            return {
                ...state,
                labelsByUnit: {
                    ...state.labelsByUnit,
                    [uid]: labels.filter(l => (l !== action.label))
                }
            }
        }
        else return state
    }
    else return state
}
////////////////////

// Sorting selection
export type SortingSelection = {
    selectedUnitIds: number[]
    visibleUnitIds: number[] | null // null means all are selected
}
export const defaultSortingSelection: SortingSelection = {
    selectedUnitIds: [],
    visibleUnitIds: null
}

export type SortingSelectionDispatch = (action: SortingSelectionAction) => void

type SetSelectedUnitIdsSortingSelectionAction = {
    type: 'SetSelectedUnitIds',
    selectedUnitIds: number[]
}

type SetVisibleUnitIdsSortingSelectionAction = {
    type: 'SetVisibleUnitIds',
    visibleUnitIds: number[] | null
}

export type SortingSelectionAction = SetSelectedUnitIdsSortingSelectionAction | SetVisibleUnitIdsSortingSelectionAction

export const sortingSelectionReducer: Reducer<SortingSelection, SortingSelectionAction> = (state: SortingSelection, action: SortingSelectionAction): SortingSelection => {
    if (action.type === 'SetSelectedUnitIds') {
        return {
            ...state,
            selectedUnitIds: action.selectedUnitIds
        }
    }
    else if (action.type === 'SetVisibleUnitIds') {
        return {
            ...state,
            visibleUnitIds: action.visibleUnitIds
        }
    }
    else return state
}
////////////////////

export interface HitherJobOpts {
    useClientCache?: boolean,
    auto_substitute_file_objects?: boolean,
    hither_config?: any,
    newHitherJobMethod?: boolean,
    job_handler_name?: string,
    required_files?: any
}

export interface HitherJob {
    jobId: string | null
    functionName: string
    kwargs: {[key: string]: any}
    opts: HitherJobOpts
    clientJobId: string
    result: any
    runtime_info: {[key: string]: any}
    error_message: string | null
    status: string
    timestampStarted: number
    timestampFinished: number | null
    wait: () => Promise<any>
}

export interface HitherContext {
    createHitherJob: (functionName: string, kwargs: {[key: string]: any}, opts: HitherJobOpts) => HitherJob
}

export interface SortingViewProps {
    sorting: Sorting
    recording: Recording
    onUnitClicked: (unitId: number, event: {ctrlKey?: boolean, shiftKey?: boolean}) => void
    curationDispatch: (action: SortingCurationAction) => void
    selection: SortingSelection
    selectionDispatch: (a: SortingSelectionAction) => void
    readOnly: boolean | null
    sortingUnitViews: {[key: string]: SortingUnitViewPlugin} // maybe this doesn't belong here
    sortingUnitMetrics: {[key: string]: SortingUnitMetricPlugin}
    hither: HitherContext
}

export interface SortingViewPlugin extends ViewPlugin {
    component: React.ComponentType<SortingViewProps>
}

export interface CalculationPool {
    requestSlot: () => Promise<{complete: () => void}>
}

export interface SortingUnitViewProps {
    sorting: Sorting
    recording: Recording
    unitId: number
    calculationPool: CalculationPool
    selectedSpikeIndex: number | null
    onSelectedSpikeIndexChanged: (index: number | null) => void
    hither: HitherContext
}

export interface SortingUnitViewPlugin extends ViewPlugin {
    component: React.ComponentType<SortingUnitViewProps>
}

export interface RecordingViewProps {
    recording: Recording
    hither: HitherContext
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