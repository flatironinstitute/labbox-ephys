import { LabboxPlugin, LabboxViewPlugin } from ".";
import { CalculationPool } from "../labbox";
import { Recording, RecordingInfo } from "./Recording";
import { Sorting, SortingInfo } from "./Sorting";
import { SortingSelection, SortingSelectionAction } from "./SortingSelection";
import { SortingCurationWorkspaceAction } from "./workspaceReducer";

export interface SortingViewProps {
    sorting: Sorting
    recording: Recording
    sortingInfo: SortingInfo
    recordingInfo: RecordingInfo
    curationDispatch: (action: SortingCurationWorkspaceAction) => void
    selection: SortingSelection
    selectionDispatch: (a: SortingSelectionAction) => void
    readOnly: boolean | null
    plugins: LabboxPlugin[]
    calculationPool: CalculationPool
    width: number
    height: number
}

export interface SortingViewPlugin extends LabboxViewPlugin {
    type: 'SortingView'
    component: React.ComponentType<SortingViewProps>
    notebookCellHeight?: number
    icon?: any
}