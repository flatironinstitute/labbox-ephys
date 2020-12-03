import { Dispatch } from "react"
import { ExtensionsConfig } from './extensions/reducers'
import CalculationPool from "./extensions/common/CalculationPool"
import { RootAction } from "./reducers"
import { DocumentInfo } from './reducers/documentInfo'
import { RegisterRecordingViewAction, RegisterSortingUnitViewAction, RegisterSortingViewAction } from './reducers/extensionContext'
import { Recording } from "./reducers/recordings"
import { Sorting } from "./reducers/sortings"

interface ViewPlugin {
    name: string
    label: string
    priority?: number
    props?: {[key: string]: any}
    fullWidth?: boolean
    defaultExpanded?: boolean
    disabled?: boolean
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
}