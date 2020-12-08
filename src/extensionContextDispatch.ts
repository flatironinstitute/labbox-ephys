import { Dispatch } from "react"
import { ExtensionContext, RecordingViewPlugin, SortingUnitMetricPlugin, SortingUnitViewPlugin, SortingViewPlugin } from "./extensions/extensionInterface"
import { RootAction } from "./reducers"
import { RegisterRecordingViewAction, RegisterSortingUnitMetricAction, RegisterSortingUnitViewAction, RegisterSortingViewAction } from "./reducers/extensionContext"

export const extensionContextDispatch = (dispatch: Dispatch<RootAction>): ExtensionContext => {
    return new ExtensionContextDispatch(dispatch)
}

export class ExtensionContextDispatch {
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