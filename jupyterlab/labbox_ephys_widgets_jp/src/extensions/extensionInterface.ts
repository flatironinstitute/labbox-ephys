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
    unitCuration?: {[key: string]: {labels: Label[]}}
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
    selectedUnitIds: {[key: string]: boolean}
    focusedUnitId: number | null
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