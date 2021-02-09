import { Reducer, useRef } from "react"
import { CalculationPool } from "./common/hither"
import { useOnce } from "./common/hooks"
import { sleepMsec } from "./common/misc"
import { SortingCurationWorkspaceAction } from "./common/workspaceReducer"

const TIME_ZOOM_FACTOR = 1.4
const AMP_SCALE_FACTOR = 1.4

export interface Sorting {
    sortingId: string
    sortingLabel: string
    sortingPath: string
    sortingObject: any
    recordingId: string
    recordingPath: string
    recordingObject: any
    externalUnitMetricsUri?: string

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
    noise_level: number
    is_downloaded?: boolean
}

export interface Recording {
    recordingId: string
    recordingLabel: string
    recordingObject: any
    recordingPath: string
}

export interface LabboxPlugin {
    name: string
    label: string
    priority?: number
    disabled?: boolean
    development?: boolean
    icon?: JSX.Element
}

export interface ViewPlugin extends LabboxPlugin {
    props?: {[key: string]: any}
    fullWidth?: boolean
    defaultExpanded?: boolean
    singleton?: boolean
}

export interface MetricPlugin extends LabboxPlugin {
    
}

// Sorting curation
export type SortingCuration = {
    labelsByUnit?: {[key: string]: string[]}
    labelChoices?: string[]
    mergeGroups?: (number[])[]
}

export type SortingCurationDispatch = (action: SortingCurationAction) => void

type SetCurationSortingCurationAction = {
    type: 'SetCuration',
    curation: SortingCuration
}

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
type MergeUnitsSortingCurationAction = {
    type: 'MergeUnits',
    unitIds: number[]
}
type UnmergeUnitsSortingCurationAction = {
    type: 'UnmergeUnits',
    unitIds: number[]
}

export type SortingCurationAction = SetCurationSortingCurationAction | AddLabelSortingCurationAction | RemoveLabelSortingCurationAction | MergeUnitsSortingCurationAction | UnmergeUnitsSortingCurationAction

export const mergeGroupForUnitId = (unitId: number, sorting: Sorting) => {
    const mergeGroups = (sorting.curation || {}).mergeGroups || []
    return mergeGroups.filter(g => (g.includes(unitId)))[0] || null
}

// This reducer is used only by the jupyter extension
type SetExternalUnitMetricsAction = {
    type: 'SetExternalUnitMetrics',
    externalUnitMetrics: ExternalSortingUnitMetric[]
}
type ExternalUnitMetricsAction = SetExternalUnitMetricsAction
export const externalUnitMetricsReducer: Reducer<ExternalSortingUnitMetric[], ExternalUnitMetricsAction> = (state: ExternalSortingUnitMetric[], action: ExternalUnitMetricsAction): ExternalSortingUnitMetric[] => {
    if (action.type === 'SetExternalUnitMetrics') {
        return action.externalUnitMetrics
    }
    else return state
}
////////////////////////////////

// Recording selection
export interface RecordingSelection {
    selectedElectrodeIds?: number[]
    visibleElectrodeIds?: number[]
    currentTimepoint?: number
    timeRange?: {min: number, max: number} | null
    ampScaleFactor?: number
    animation?: {
        currentTimepointVelocity: number // timepoints per second
    }
    waveformsMode?: 'geom' | 'vertical'
}

export const useRecordingAnimation = (selection: RecordingSelection, selectionDispatch: RecordingSelectionDispatch) => {
    const ref = useRef({
        lastUpdateTimestamp: Number(new Date()),
        selection,
        selectionDispatch
    })
    ref.current.selection = selection
    ref.current.selectionDispatch = selectionDispatch

    const animationFrame = () => {
        const lastUpdate = ref.current.lastUpdateTimestamp
        const current = Number(new Date())
        const elapsed = current - lastUpdate
        if (elapsed !== 0) {
            const currentTimepointVelocity = ref.current.selection.animation?.currentTimepointVelocity || 0
            const currentTimepoint = ref.current.selection.currentTimepoint
            if ((currentTimepointVelocity) && (currentTimepoint !== undefined)) {
                const t = Math.round(currentTimepoint + currentTimepointVelocity * (elapsed / 1000))
                ref.current.selectionDispatch({type: 'SetCurrentTimepoint', currentTimepoint: t})
            }
        }
        ref.current.lastUpdateTimestamp = Number(new Date())
    }

    // only do this once
    useOnce(() => {
        ;(async () => {
            while (true) {
                await sleepMsec(50)
                animationFrame()
            }
        })()
    })
}

export type RecordingSelectionDispatch = (action: RecordingSelectionAction) => void

type SetRecordingSelectionRecordingSelectionAction = {
    type: 'SetRecordingSelection',
    recordingSelection: RecordingSelection
}

type SetSelectedElectrodeIdsRecordingSelectionAction = {
    type: 'SetSelectedElectrodeIds',
    selectedElectrodeIds: number[]
}

type SetVisibleElectrodeIdsRecordingSelectionAction = {
    type: 'SetVisibleElectrodeIds',
    visibleElectrodeIds: number[]
}

type SetCurrentTimepointRecordingSelectionAction = {
    type: 'SetCurrentTimepoint',
    currentTimepoint: number | null,
    ensureInRange?: boolean
}

type SetTimeRangeRecordingSelectionAction = {
    type: 'SetTimeRange',
    timeRange: {min: number, max: number} | null
}

type ZoomTimeRangeRecordingSelectionAction = {
    type: 'ZoomTimeRange',
    factor?: number             // uses default if unset
    direction?: 'in' | 'out'    // default direction is 'in'. If direction is set to 'out', 'factor' is inverted.
}

type SetAmpScaleFactorRecordingSelectionAction = {
    type: 'SetAmpScaleFactor',
    ampScaleFactor: number
}

type ScaleAmpScaleFactorRecordingSelectionAction = {
    type: 'ScaleAmpScaleFactor',
    multiplier?: number         // uses default if unset
    direction?: 'up' | 'down'   // default direction is 'up'. If direction is set to 'down', multiplier is inverted.
}

type SetCurrentTimepointVelocityRecordingSelectionAction = {
    type: 'SetCurrentTimepointVelocity',
    velocity: number // timepoints per second
}

type SetWaveformsModeRecordingSelectionAction = {
    type: 'SetWaveformsMode',
    waveformsMode: 'geom' | 'vertical'
}

type SetRecordingSelectionAction = {
    type: 'Set',
    state: RecordingSelection
}

export type RecordingSelectionAction = SetRecordingSelectionRecordingSelectionAction | SetSelectedElectrodeIdsRecordingSelectionAction | SetVisibleElectrodeIdsRecordingSelectionAction | SetCurrentTimepointRecordingSelectionAction | SetTimeRangeRecordingSelectionAction | ZoomTimeRangeRecordingSelectionAction | SetAmpScaleFactorRecordingSelectionAction | ScaleAmpScaleFactorRecordingSelectionAction | SetCurrentTimepointVelocityRecordingSelectionAction | SetWaveformsModeRecordingSelectionAction | SetRecordingSelectionAction

const adjustTimeRangeToIncludeTimepoint = (timeRange: {min: number, max: number}, timepoint: number) => {
    if ((timeRange.min <= timepoint) && (timepoint < timeRange.max)) return timeRange
    const span = timeRange.max - timeRange.min
    const t1 = Math.max(0, Math.floor(timepoint - span / 2))
    const t2 = t1 + span
    return {min: t1, max: t2}
}

export const recordingSelectionReducer: Reducer<RecordingSelection, RecordingSelectionAction> = (state: RecordingSelection, action: RecordingSelectionAction): RecordingSelection => {
    if (action.type === 'SetRecordingSelection') {
        return {...action.recordingSelection}
    }
    else if (action.type === 'SetSelectedElectrodeIds') {
        return {
            ...state,
            selectedElectrodeIds: action.selectedElectrodeIds.filter(eid => ((!state.visibleElectrodeIds) || (state.visibleElectrodeIds.includes(eid))))
        }
    }
    else if (action.type === 'SetVisibleElectrodeIds') {
        return {
            ...state,
            visibleElectrodeIds: action.visibleElectrodeIds,
            selectedElectrodeIds: state.selectedElectrodeIds ? state.selectedElectrodeIds.filter(eid => (action.visibleElectrodeIds.includes(eid))) : undefined
        }
    }
    else if (action.type === 'SetCurrentTimepoint') {
        return {
            ...state,
            currentTimepoint: action.currentTimepoint || undefined,
            timeRange: action.ensureInRange && (state.timeRange) && (action.currentTimepoint !== null) ? adjustTimeRangeToIncludeTimepoint(state.timeRange, action.currentTimepoint) : state.timeRange
        }
    }
    else if (action.type === 'SetTimeRange') {
        return {
            ...state,
            timeRange: action.timeRange
        }
    }
    else if (action.type === 'ZoomTimeRange') {
        const maxTimeSpan = 30000 * 60 * 5
        const currentTimepoint = state.currentTimepoint
        const timeRange = state.timeRange
        if (!timeRange) return state
        const direction = action.direction ?? 'in'
        const pre_factor = action.factor ?? TIME_ZOOM_FACTOR
        const factor = direction === 'out' ? 1 / pre_factor : pre_factor
        
        if ((timeRange.max - timeRange.min) / factor > maxTimeSpan ) return state
        let t: number
        if ((currentTimepoint === undefined) || (currentTimepoint < timeRange.min))
            t = timeRange.min
        else if (currentTimepoint > timeRange.max)
            t = timeRange.max
        else
            t = currentTimepoint
        const newTimeRange = zoomTimeRange(timeRange, factor, t)
        return {
            ...state,
            timeRange: newTimeRange
        }
        // return fix({
        //     ...state,
        //     timeRange: newTimeRange
        // })
    }
    else if (action.type === 'SetAmpScaleFactor') {
        return {
            ...state,
            ampScaleFactor: action.ampScaleFactor
        }
    }
    else if (action.type === 'ScaleAmpScaleFactor') {
        const direction = action.direction ?? 'up'
        const pre_multiplier = action.multiplier ?? AMP_SCALE_FACTOR
        const multiplier = direction === 'down' ? 1 / pre_multiplier : pre_multiplier
        return {
            ...state,
            ampScaleFactor: (state.ampScaleFactor || 1) * multiplier
        }
    }
    else if (action.type === 'SetCurrentTimepointVelocity') {
        return {
            ...state,
            animation: {
                ...(state.animation || {}),
                currentTimepointVelocity: action.velocity
            }
        }
    }
    else if (action.type === 'SetWaveformsMode') {
        return {
            ...state,
            waveformsMode: action.waveformsMode
        }
    }
    else if (action.type === 'Set') {
        return action.state
    }
    else return state
}
////////////////////

// Sorting selection
export interface SortingSelection extends RecordingSelection {
    selectedUnitIds?: number[]
    visibleUnitIds?: number[] | null // null means all are selected
}

export type SortingSelectionDispatch = (action: SortingSelectionAction) => void

type SetSelectionSortingSelectionAction = {
    type: 'SetSelection',
    selection: SortingSelection
}

type SetSelectedUnitIdsSortingSelectionAction = {
    type: 'SetSelectedUnitIds',
    selectedUnitIds: number[]
}

type SetVisibleUnitIdsSortingSelectionAction = {
    type: 'SetVisibleUnitIds',
    visibleUnitIds: number[] | null
}

type SetSortingSelectionAction = {
    type: 'Set',
    state: SortingSelection
}

type UnitClickedSortingSelectionAction = {
    type: 'UnitClicked'
    unitId: number
    ctrlKey?: boolean
    shiftKey?: boolean
}

export type SortingSelectionAction = SetSelectionSortingSelectionAction | SetSelectedUnitIdsSortingSelectionAction | SetVisibleUnitIdsSortingSelectionAction | UnitClickedSortingSelectionAction | SetSortingSelectionAction | RecordingSelectionAction

const unitClickedReducer = (state: SortingSelection, action: UnitClickedSortingSelectionAction): SortingSelection => {
    const unitId = action.unitId
    if (action.ctrlKey) {
        if ((state.selectedUnitIds || []).includes(unitId)) {
            return {
                ...state,
                selectedUnitIds: (state.selectedUnitIds || []).filter(uid => (uid !== unitId))
            }
        }
        else {
            return {
                ...state,
                selectedUnitIds: [...(state.selectedUnitIds || []), unitId]
            }
        }
    }
    // todo: restore anchor/shift-select behavior somewhere
    else {
        return {
            ...state,
            selectedUnitIds: [unitId]
        }
    }
}

export const sortingSelectionReducer: Reducer<SortingSelection, SortingSelectionAction> = (state: SortingSelection, action: SortingSelectionAction): SortingSelection => {
    if (action.type === 'SetSelection') {
        return action.selection
    }
    else if (action.type === 'SetSelectedUnitIds') {
        return {
            ...state,
            selectedUnitIds: action.selectedUnitIds.filter(uid => ((!state.visibleUnitIds) || (state.visibleUnitIds?.includes(uid))))
        }
    }
    else if (action.type === 'SetVisibleUnitIds') {
        return {
            ...state,
            selectedUnitIds: state.selectedUnitIds ? state.selectedUnitIds.filter(uid => action.visibleUnitIds?.includes(uid)) : undefined,
            visibleUnitIds: action.visibleUnitIds
        }
    }
    else if (action.type === 'UnitClicked') {
        return unitClickedReducer(state, action)
    }
    else if (action.type === 'Set') {
        return action.state
    }
    else {
        return recordingSelectionReducer(state, action)
    }
}
////////////////////

export interface Plugins {
    recordingViews: {[key: string]: RecordingViewPlugin}
    sortingViews: {[key: string]: SortingViewPlugin}
    sortingUnitViews: {[key: string]: SortingUnitViewPlugin}
    sortingUnitMetrics: {[key: string]: SortingUnitMetricPlugin}
}

const filterObject = <T>(x: {[key: string]: T}, filter: (x: T) => boolean): {[key: string]: T} => {
    const ret: {[key: string]: T} = {}
    for (let k in x) {
        if (filter(x[k])) ret[k] = x[k]
    }
    return ret
}
  
export const filterPlugins = (plugins: Plugins): Plugins => {  
    const filter = (v: LabboxPlugin) => ((!v.disabled) && (!v.development))
    return {
        recordingViews: filterObject(plugins.recordingViews, filter),
        sortingViews: filterObject(plugins.sortingViews, filter),
        sortingUnitViews: filterObject(plugins.sortingUnitViews, filter),
        sortingUnitMetrics: filterObject(plugins.sortingUnitMetrics, filter)
    }
}
interface ViewProps {
    plugins: Plugins
    calculationPool: CalculationPool
    width?: number
    height?: number
}

export interface SortingViewProps extends ViewProps {
    sorting: Sorting
    recording: Recording
    sortingInfo: SortingInfo
    recordingInfo: RecordingInfo
    curationDispatch: (action: SortingCurationWorkspaceAction) => void
    selection: SortingSelection
    selectionDispatch: (a: SortingSelectionAction) => void
    readOnly: boolean | null
    plugins: Plugins
}

export interface SortingViewPlugin extends ViewPlugin {
    component: React.ComponentType<SortingViewProps>
    notebookCellHeight?: number
}
export interface SortingUnitViewProps extends SortingViewProps {
    unitId: number
    selectedSpikeIndex: number | null
    onSelectedSpikeIndexChanged?: (index: number | null) => void
}

export interface SortingUnitViewPlugin extends ViewPlugin {
    component: React.ComponentType<SortingUnitViewProps>
}

export interface RecordingViewProps extends ViewProps {
    recording: Recording
    recordingInfo: RecordingInfo
    selection: RecordingSelection
    selectionDispatch: RecordingSelectionDispatch
}

export interface RecordingViewPlugin extends ViewPlugin {
    component: React.ComponentType<RecordingViewProps>
}

export interface SortingUnitMetricPlugin extends MetricPlugin {
    columnLabel: string,
    tooltip: string,
    hitherFnName: string,
    metricFnParams: {[key: string]: any},
    hitherOpts: {
        useClientCache?: boolean
    },
    component: (record: any) => JSX.Element,
    isNumeric: boolean,
    getValue: (record: any) => number | string
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

const zoomTimeRange = (timeRange: {min: number, max: number}, factor: number, anchorTime: number): {min: number, max: number} => {
    const oldT1 = timeRange.min
    const oldT2 = timeRange.max
    const t1 = anchorTime + (oldT1 - anchorTime) / factor
    const t2 = anchorTime + (oldT2 - anchorTime) / factor
    return {min: Math.floor(t1), max: Math.floor(t2)}
}