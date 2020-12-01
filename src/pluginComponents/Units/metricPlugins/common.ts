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
    development?: boolean
}