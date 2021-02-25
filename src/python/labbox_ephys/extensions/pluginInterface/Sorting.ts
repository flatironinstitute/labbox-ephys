import { ExternalSortingUnitMetric } from "./exteneralUnitMetrics";
import { SortingCuration } from "./SortingCuration";

export interface SortingInfo {
    unit_ids: number[]
    samplerate: number
}

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