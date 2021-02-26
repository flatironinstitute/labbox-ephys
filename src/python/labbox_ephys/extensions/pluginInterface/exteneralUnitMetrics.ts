import { Reducer } from "react"

export type ExternalSortingUnitMetric = {name: string, label: string, tooltip?: string, data: {[key: string]: number}}

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