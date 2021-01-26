
import { Button, Paper } from '@material-ui/core';
import React, { useCallback, useContext, useEffect, useReducer, useState } from 'react';
<<<<<<< 8b5ea1ca1a2be14685dd7e844b3ef682a6e48e34
<<<<<<< fae5d1af6666e69aa85868b4ea976236e06723c3
import { useSortingInfo } from '../../common/getRecordingInfo';
=======
import { useSortingInfo } from '../../../actions/getRecordingInfo';
>>>>>>> workspace view and simplified state flow
=======
import { useSortingInfo } from '../../common/getRecordingInfo';
>>>>>>> misc fixes
import { HitherContext } from '../../common/hither';
import { Recording, SortingUnitMetricPlugin, SortingViewProps } from '../../extensionInterface';
import sortByPriority from '../../sortByPriority';
import UnitsTable from './UnitsTable';

// const defaultLabelOptions = ['noise', 'MUA', 'artifact', 'accept', 'reject'];

// const metricPlugins: MetricPlugin[] = Object.values(pluginComponents)
//                             .filter(plugin => {
//                                 const p = plugin as any
//                                 return (p.type === 'metricPlugin')
//                             })
//                             .map(plugin => {
//                                 return plugin as MetricPlugin
//                             })

type Status = 'waiting' | 'completed' | 'executing' | 'error'

type MetricDataState = {[key: string]: {
    status: Status
    data: any | null
    error: string | null
}}

const initialMetricDataState: MetricDataState = {}

interface MetricDataAction {
    metricName: string
    status: Status
    data?: any
    error?: string
}

const updateMetricData = (state: MetricDataState, action: MetricDataAction | 'clear'): MetricDataState => {
    if (action === 'clear') return {}
    const { metricName, status, data, error } = action
    if (state[metricName] && state[metricName].status === 'completed') {
        console.warn(`Updating status of completed metric ${metricName}??`);
        return state;
    }
    return {
        ...state,
        [metricName]: {
            'status': status,
            'data': status === 'completed' ? data || null : null,
            'error': status === 'error' ? error || null : null
        }
    }
}

interface OwnProps {
    maxHeight?: number
    width?: number
}

const Units: React.FunctionComponent<SortingViewProps & OwnProps> = (props) => {
    const hither = useContext(HitherContext)
    const { sorting, recording, selection, selectionDispatch, plugins, width, height } = props
    const [expandedTable, setExpandedTable] = useState(false)
    const [metrics, updateMetrics] = useReducer(updateMetricData, initialMetricDataState)
    const [previousRecording, setPreviousRecording] = useState<Recording | null>(null)

    useEffect(() => {
        if (previousRecording !== recording) {
            updateMetrics('clear')
            setPreviousRecording(recording)
        }
    }, [recording, previousRecording, setPreviousRecording, updateMetrics])


    const fetchMetric = useCallback(async (metric: SortingUnitMetricPlugin) => {
        const name = metric.name;

        if (name in metrics) {
            return metrics[name];
        }
        // TODO: FIXME! THIS STATE IS NOT PRESERVED BETWEEN UNFOLDINGS!!!
        // TODO: May need to bump this up to the parent!!!
        // new request. Add state to cache, dispatch job, then update state as results come back.
        updateMetrics({metricName: metric.name, status: 'executing'})
        try {
            const data = await hither.createHitherJob(
                metric.hitherFnName,
                {
                    sorting_object: sorting.sortingObject,
                    recording_object: recording.recordingObject,
                    configuration: metric.metricFnParams
                },
                metric.hitherOpts
            ).wait();
            updateMetrics({metricName: metric.name, status: 'completed', data})
        } catch (err) {
            console.error(err);
            updateMetrics({metricName: metric.name, status: 'error', error: err.message})
        }
    }, [metrics, sorting.sortingObject, recording.recordingObject, hither]);

    useEffect(() => { 
        sortByPriority(plugins.sortingUnitMetrics).filter(p => (!p.disabled)).forEach(async mp => await fetchMetric(mp));
    }, [plugins.sortingUnitMetrics, metrics, fetchMetric]);

    const sortingInfo = useSortingInfo(sorting.sortingObject, sorting.recordingObject)
    if (!sortingInfo) return <div>No sorting info</div>

    let units = selection.visibleUnitIds || sortingInfo.unit_ids;
    let showExpandButton = false;
    if ((!expandedTable) && (units.length > 30)) {
        units = units.slice(0, 30);
        showExpandButton = true;
    }

    return (
        <div style={{width: width || 300}}>
            <Paper style={{maxHeight: props.maxHeight, overflow: 'auto'}}>
                <UnitsTable 
                    sortingUnitMetrics={plugins.sortingUnitMetrics}
                    units={units}
                    metrics={metrics}
                    selection={selection}
                    selectionDispatch={selectionDispatch}
                    sorting={sorting}
                    height={height}
                />
                {
                    showExpandButton && (
                        <Button onClick={() => {setExpandedTable(true)}}>Show all units</Button>
                    )
                }
            </Paper>
            {/* {
                (!readOnly) && (
                    <div>
                        <MultiComboBox
                            id="label-selection"
                            label='Choose labels'
                            placeholder='Add label'
                            onSelectionsChanged={(event: any, value: any) => setActiveOptions(value)}
                            options={labelOptions}
                        />
                        <Button onClick={() => handleApplyLabels(selectedRowKeys, activeOptions)}>Apply selected labels</Button>
                        <Button onClick={() => handlePurgeLabels(selectedRowKeys, activeOptions)}>Remove selected labels</Button>
                    </div>
                )
            } */}
        </div>
    );
}

export default Units