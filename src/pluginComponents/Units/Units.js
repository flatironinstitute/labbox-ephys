import React, { useState, useCallback, useEffect, useReducer } from 'react';
import sampleSortingViewProps from '../common/sampleSortingViewProps';
import { Button, Paper, CircularProgress } from '@material-ui/core';
import { createHitherJob } from '../../hither';
import MultiComboBox from '../../components/MultiComboBox';
import UnitsTable from './UnitsTable';
import * as pluginComponents from './metricPlugins';

const defaultLabelOptions = ['noise', 'MUA', 'artifact', 'accept', 'reject'];

const metricPlugins = Object.values(pluginComponents)
                            .filter(plugin => (plugin.metricPlugin))

const STATES = {
    completed: 'completed',
    executing: 'executing',
    error: 'error'
}

const updateMetricData = (state, [metricName, status, dataObject]) => {
    if (state[metricName] && state[metricName]['status'] === 'completed') {
        console.warn(`Updating status of completed metric ${metricName}??`);
        return state;
    }
    return {
        ...state,
        [metricName]: {
            'status': status,
            'data': status === STATES.completed ? dataObject : '',
            'error': status === STATES.error ? dataObject : ''
        }
    }
}


const Units = ({ sorting, recording, selectedUnitIds, extensionsConfig,
                onAddUnitLabel, onRemoveUnitLabel,
                onSelectedUnitIdsChanged, readOnly }) => {
    const [activeOptions, setActiveOptions] = useState([]);
    const [metrics, updateMetrics] = useReducer(updateMetricData, {});
    const activeMetricPlugins = metricPlugins.filter(
        p => (!p.metricPlugin.development || (extensionsConfig.enabled.development)));

    const labelOptions = [...new Set(
        defaultLabelOptions.concat(
            Object.keys(sorting.unitCuration || {})
                .reduce(
                    (allLabels, unitId) => {
                        return allLabels.concat((sorting.unitCuration)[unitId].labels || [])
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

    const fetchMetric = useCallback(async (metric = {metricName: '', hitherFnName: '',
                                                    metricFnParams: {}, hitherConfig: {}}) => {
        const name = metric.metricName;

        if (name in metrics) {
            return metrics[name];
        }
        // TODO: FIXME! THIS STATE IS NOT PRESERVED BETWEEN UNFOLDINGS!!!
        // TODO: May need to bump this up to the parent!!!
        // new request. Add state to cache, dispatch job, then update state as results come back.
        updateMetrics([metric.metricName, STATES.executing, '']);
        try {
            const data = await createHitherJob(metric.hitherFnName,
                {
                    sorting_object: sorting.sortingObject,
                    recording_object: recording.recordingObject,
                    configuration: metric.metricFnParams
                },
                {
                    ...metric.hitherConfig,
                    required_files: sorting.sortingObject
                });
            updateMetrics([metric.metricName, STATES.completed, data]);
        } catch (err) {
            console.error(err);
            updateMetrics([metric.metricName, STATES.error, err]);
        }
    }, [metrics, sorting.sortingObject, recording.recordingObject]);

    useEffect(() => { 
        activeMetricPlugins.forEach(async mp => await fetchMetric(mp));
    }, [activeMetricPlugins, metrics, fetchMetric]);


    const selectedRowKeys = sorting.sortingInfo.unit_ids
        .reduce((obj, id) => ({...obj, [id]: selectedUnitIds[id] || false}), {});

    const handleAddLabel = (unitId, label) => {
        onAddUnitLabel({sortingId: sorting.sortingId, unitId: unitId, label: label});
    }
    const handleRemoveLabel = (unitId, label) => {
        onRemoveUnitLabel({sortingId: sorting.sortingId, unitId: unitId, label: label});
    }
    const handleApplyLabels = (selectedRowKeys, labels) => {
        Object.keys(selectedRowKeys).forEach((key) => selectedRowKeys[key]
            ? labels.forEach((label) => handleAddLabel(key, label))
            : {});
    };
    const handlePurgeLabels = (selectedRowKeys, labels) => {
        Object.keys(selectedRowKeys).forEach((key) => selectedRowKeys[key]
            ? labels.forEach((label) => handleRemoveLabel(key, label))
            : {});
    };

    const units = sorting.sortingInfo.unit_ids;

    // TODO: define additional columns such as: num. events, avg. firing rate, snr, ...
    if (Object.keys(metrics).length === 0 ) { // empty object
        return (
            <div style={{'width': '100%'}}>
                <CircularProgress />
            </div>
        );
    }
    return (
        <div style={{'width': '100%'}}>
            <Paper style={{maxHeight: 350, overflow: 'auto'}}>
                <UnitsTable 
                    metricPlugins={activeMetricPlugins}
                    units={units}
                    metrics={metrics}
                    selectedUnitIds={selectedUnitIds}
                    sorting={sorting}
                    onSelectedUnitIdsChanged={onSelectedUnitIdsChanged}
                />
            </Paper>
            {
                (!readOnly) && (
                    <div>
                        <MultiComboBox
                            id="label-selection"
                            label='Choose labels'
                            placeholder='Add label'
                            onSelectionsChanged={(event, value) => setActiveOptions(value)}
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

const label = 'Units Table'

Units.sortingViewPlugin = {
    label: label
}

Units.prototypeViewPlugin = {
    label: label,
    props: sampleSortingViewProps()
}

export default Units;