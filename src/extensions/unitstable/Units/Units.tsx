
import { Button, Paper } from '@material-ui/core';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import MultiComboBox from '../../common/MultiComboBox';
import { SortingUnitMetricPlugin, SortingViewProps } from '../../extensionInterface';
import sortByPriority from '../../sortByPriority';
import UnitsTable from './UnitsTable';

const defaultLabelOptions = ['noise', 'MUA', 'artifact', 'accept', 'reject'];

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

const updateMetricData = (state: MetricDataState, action: MetricDataAction): MetricDataState => {
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

type Label = string

const Units: React.FunctionComponent<SortingViewProps> = (props) => {
    const { sorting, recording, selectedUnitIds, onAddUnitLabel, onRemoveUnitLabel, onSelectedUnitIdsChanged, readOnly, sortingUnitMetrics, hither } = props
    const [activeOptions, setActiveOptions] = useState([]);
    const [expandedTable, setExpandedTable] = useState(false);
    const [metrics, updateMetrics] = useReducer(updateMetricData, initialMetricDataState);
    // const activeMetricPlugins = metricPlugins.filter(
    //     p => (!p.development || (extensionsConfig.enabled.development)));

    const labelOptions = [...new Set(
        defaultLabelOptions.concat(
            Object.keys(sorting.unitCuration || {})
                .reduce(
                    (allLabels: Label[], unitId: string) => {
                        const u = (sorting.unitCuration || {})[unitId]
                        return allLabels.concat(u.labels || [])
                    }, [])
        )
    )].sort((a, b) => {
        // note this will sort numbers like strings. If that's a problem, we
        // might need a more sophisticated solution.
        const aUpper = a.toUpperCase();
        const bUpper = b.toUpperCase();
        if (aUpper < bUpper) return -1;
        if (aUpper > bUpper) return 1;
        if (a < b) return -1;
        if (b > a) return 1;
        return 0;
    });

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
            const data = await hither.createHitherJob(metric.hitherFnName,
                {
                    sorting_object: sorting.sortingObject,
                    recording_object: recording.recordingObject,
                    configuration: metric.metricFnParams
                },
                {
                    ...metric.hitherConfig,
                    required_files: sorting.sortingObject
                }
            ).wait();
            updateMetrics({metricName: metric.name, status: 'completed', data})
        } catch (err) {
            console.error(err);
            updateMetrics({metricName: metric.name, status: 'error', error: err.message})
        }
    }, [metrics, sorting.sortingObject, recording.recordingObject, hither]);

    useEffect(() => { 
        sortByPriority(sortingUnitMetrics).filter(p => (!p.disabled)).forEach(async mp => await fetchMetric(mp));
    }, [sortingUnitMetrics, metrics, fetchMetric]);

    const { sortingInfo } = sorting
    if (!sortingInfo) return <div>No sorting info</div>

    const selectedRowKeys = sortingInfo.unit_ids
        .reduce((obj, id) => ({...obj, [id]: selectedUnitIds[id] || false}), {});

    const handleAddLabel = (unitId: number, label: Label) => {
        onAddUnitLabel({sortingId: sorting.sortingId, unitId: unitId, label: label})
    }
    const handleRemoveLabel = (unitId: number, label: Label) => {
        onRemoveUnitLabel({sortingId: sorting.sortingId, unitId: unitId, label: label})
    }
    const handleApplyLabels = (selectedRowKeys: {[key: string]: any}, labels: Label[]) => {
        Object.keys(selectedRowKeys).forEach((key) => selectedRowKeys[key]
            ? labels.forEach((label) => handleAddLabel(Number(key), label))
            : {});
    };
    const handlePurgeLabels = (selectedRowKeys: {[key: string]: any}, labels: Label[]) => {
        Object.keys(selectedRowKeys).forEach((key) => selectedRowKeys[key]
            ? labels.forEach((label) => handleRemoveLabel(Number(key), label))
            : {});
    };

    let units = sortingInfo.unit_ids;
    let showExpandButton = false;
    if ((!expandedTable) && (units.length > 30)) {
        units = units.slice(0, 30);
        showExpandButton = true;
    }

    return (
        <div style={{'width': '100%'}}>
            <Paper style={{maxHeight: 350, overflow: 'auto'}}>
                <UnitsTable 
                    sortingUnitMetrics={sortingUnitMetrics}
                    units={units}
                    metrics={metrics}
                    selectedUnitIds={selectedUnitIds}
                    sorting={sorting}
                    onSelectedUnitIdsChanged={onSelectedUnitIdsChanged}
                />
                {
                    showExpandButton && (
                        <Button onClick={() => {setExpandedTable(true)}}>Show all units</Button>
                    )
                }
            </Paper>
            {
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
            }
        </div>
    );
}

export default Units