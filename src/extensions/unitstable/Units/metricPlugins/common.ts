export interface MetricValue {
    numericValue: number,
    stringValue: string,
    isNumeric: boolean
}
export interface MetricPlugin {
    type: 'metricPlugin'
    metricName: string
    columnLabel: string
    tooltip: string
    hitherFnName: string
    metricFnParams: {[key: string]: any}
    hitherConfig: {
        wait: boolean,
        useClientCache: boolean,
        newHitherJobMethod?: boolean,
        auto_substitute_file_objects?: boolean,
        hither_config?: {
            use_job_cache: boolean
        },
        job_handler_name?: string
    }
    component: React.ComponentType<{record: any}>
    // comparer: (data: {[key: string]: any}) => (aval: number, bval: number, sortAscending: boolean) => number
    getRecordValue: (r: any) => MetricValue
    development?: boolean
}

const baseNumericComparer = (a: number, b: number, sortAscending: boolean): number => {
    // if both values are NaN, mark them equal; otherwise sort NaNs after any numeric values.
    if (isNaN(a) && isNaN(b)) return 0
    if (isNaN(a)) return -1
    if (isNaN(b)) return 1
    // Don't mess with the ordering of two infinities; otherwise sort infinity as greater than finite values
    if (a === Infinity && b === Infinity) return 0
    if (a === Infinity) return sortAscending ? 1 : -1
    if (b === Infinity) return sortAscending ? 1 : -1
    return sortAscending ? (a - b) : (b - a)
}

export const sortMetricValues = (a: MetricValue, b: MetricValue, sortAscending: boolean): number => {
    if (a.isNumeric) {
        return baseNumericComparer(a.numericValue, b.numericValue, sortAscending)
    } else { // it's a string
        if (a.stringValue === b.stringValue) return 0
        // A goes first if it's less than B and we're ascending, or it's greater than B and we're descending
        return (a.stringValue < b.stringValue) === sortAscending ? -1 : 1
    }
}
