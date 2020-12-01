import { Dispatch } from "react"
import { ExtensionsConfig } from './extensions/reducers'
import { RootAction } from "./reducers"
import { DocumentInfo } from './reducers/documentInfo'
import { RegisterSortingViewAction } from './reducers/extensionContext'
import { Recording } from "./reducers/recordings"
import { Sorting } from "./reducers/sortings"

interface ViewPlugin {
    name: string
    label: string
    props?: {[key: string]: any}
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
}

export interface SortingViewPlugin extends ViewPlugin {
    component: React.ComponentType<SortingViewProps>
}

export class ExtensionContext {
    #sortingViews = new Map<string, SortingViewPlugin>()
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
        this.#sortingViews.delete(name)
    }
    sortingViews() {
        return [...this.#sortingViews]
    }
}