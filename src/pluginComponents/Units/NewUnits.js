import React, { useState, useCallback, useEffect, useReducer } from 'react';
import sampleSortingViewProps from '../common/sampleSortingViewProps';
import { Button, Paper, Table, TableHead, TableBody, TableRow, TableCell, Checkbox, LinearProgress, CircularProgress } from '@material-ui/core';
import { createHitherJob } from '../../hither';
import MultiComboBox from '../../components/MultiComboBox';
import * as pluginComponents from './metricPlugins';

const defaultLabelOptions = ['noise', 'MUA', 'artifact', 'accept', 'reject'];

const metricPlugins = Object.values(pluginComponents)
                            .filter(plugin => (plugin.metricPlugin));
                            // add a .map(p => p['metricPlugin']) for simplicity?

const STATES = {
    completed: 'completed',
    executing: 'executing',
    error: 'error'
}

// TODO: Filter with a Development flag?

// TODO: SPLIT OUT THE VIEW FROM THE MODEL HERE, THIS IS A MESS

// TODO DELETE THIS
const TIMEOUT = (ms) => (new Promise(resolve => setTimeout(resolve, ms)));
    // TIMING, MANUAL STYLE
    // const pretime = Date.now()
    // console.log(`Computing firing data took ${Date.now() - pretime} ms.`)

const updateMetricData = (state, [metricName, status, dataObject]) => {
    console.log(`Call to updateMetricData values ${metricName}, ${status}, ${dataObject}`)
    if (state[metricName] && state[metricName]['status'] === 'completed') {
        console.warn(`Updating status of completed metric ${metricName}??`);
        return state;
    }
    return {
        ...state,
        [metricName]: {
            'status': status,
            'data': status === STATES.completed ? dataObject : NaN,
            'error': status === STATES.error ? dataObject : ''
        }
    }
}

// TODO: Consider styling to narrow down that first column
const HeaderRow = React.memo(({pluginLabels}) => {
    return (
        <TableHead>
            <TableRow>
                <TableCell key="_first" style={{ width: 0}} />
                <TableCell key="_unitIds"><span>Unit ID</span></TableCell>
                <TableCell key="_labels"><span>Labels</span></TableCell>
                {
                    pluginLabels.map(plugin => (
                        <TableCell key={plugin + '_header'}>
                            <span>{plugin}</span>
                        </TableCell>
                    ))
                }
            </TableRow>
        </TableHead>
    );
});

const UnitCheckbox = React.memo(({unitKey, selected, handleClicked}) => {
    return (
        <TableCell>
            <Checkbox
                checked={selected}
                onClick={() => handleClicked(unitKey)}
            />
        </TableCell>
    );
});

const UnitIdCell = React.memo(({id}) => (
    <TableCell><span>{id}</span></TableCell>
));

const UnitLabelCell = React.memo(({labels}) => (
    <TableCell><span>{labels}</span></TableCell>
));

const MetricCell = React.memo(({error = '', data, PayloadComponent}) => {
    // console.log(`Rendering ${PayloadComponent}`);
    if (error !== '') {
        return (<TableCell><span>{`Error: ${error}`}</span></TableCell>);
    }
    if (!data || isNaN(data)) {
        return (<TableCell><LinearProgress style={{'width': '80%'}}/></TableCell>);
    } else {
        return (
            <TableCell>
                <PayloadComponent 
                    record = {data}
                />
            </TableCell>
        );
    }
});


const NewUnits = ({ sorting, recording, selectedUnitIds,
                onAddUnitLabel, onRemoveUnitLabel,
                onSelectedUnitIdsChanged }) => {
    const [activeOptions, setActiveOptions] = useState([]);
    const [metrics, updateMetrics] = useReducer(updateMetricData, {});

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

    const fetchMetric = useCallback(async (metric = {metricName: '', hitherFnName: '', hitherConfig: {}}) => {
        const name = metric.metricName;

        if (name in metrics) {
            return metrics[name];
        }
        // new request. Add state to cache, dispatch job, then update state as results come back.
        // TODO: FIXME! THIS STATE IS NOT PRESERVED BETWEEN UNFOLDINGS!!!
        updateMetrics([metric.metricName, STATES.executing, '']);
        try {
            const data = await createHitherJob(metric.hitherFnName,
                {
                    sorting_object: sorting.sortingObject,
                    recording_object: recording.recordingObject
                },
                metric.hitherConfig);
            // await TIMEOUT(2000);
            updateMetrics([metric.metricName, STATES.completed, data]);
            console.log(`Data should now be ${JSON.stringify(data)}`)
        } catch (err) {
            console.error(err);
            updateMetrics([metric.metricName, STATES.error, err]);
        }
    }, [metrics, sorting.sortingObject, recording.recordingObject]);

    useEffect(() => { 
        metricPlugins.forEach(async mp => await fetchMetric(mp['metricPlugin']));
    }, [metrics, fetchMetric]);


    const selectedRowKeys = sorting.sortingInfo.unit_ids
        .reduce((obj, id) => ({...obj, [id]: selectedUnitIds[id] || false}), {});

    const getLabelsForUnitId = unitId => {
        const unitCuration = sorting.unitCuration || {};
        return (unitCuration[unitId] || {}).labels || [];
    }
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

    // may need to stringify
    const rows = sorting.sortingInfo.unit_ids;

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
                <Table className="NiceTable">
                    <HeaderRow 
                        pluginLabels={metricPlugins.map(mp => mp['metricPlugin']['columnLabel'])}
                    />
                    <TableBody>
                        {
                            rows.map((unitId) => (
                                <TableRow key={unitId + '_row'}>
                                    <UnitCheckbox
                                        unitKey = {unitId}
                                        selected = {selectedUnitIds[unitId] || false}
                                        handleClicked = {onSelectedUnitIdsChanged}
                                    />
                                    <UnitIdCell id = {unitId} />
                                    <UnitLabelCell
                                        labels = {getLabelsForUnitId(unitId).join(', ')}
                                    />
                                    {
                                        metricPlugins.map(mp => {
                                            const metricName = mp['metricPlugin']['metricName'];
                                            const metric = metrics[metricName] || {'data': NaN, error: ''};
                                            return (
                                                <MetricCell
                                                    key = {metricName + '_' + unitId}
                                                    data = {(isNaN(metric['data']) || !metric['data'][unitId])
                                                        ? NaN : metric['data'][unitId]}
                                                    error = {metric['error']}
                                                    PayloadComponent = {metricName}
                                                />
                                            );
                                        })
                                    }
                                </TableRow>       
                            ))
                        }
                    </TableBody>
                </Table>
            </Paper>
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
        </div>
    );
}

const label = 'New Units Table'

NewUnits.sortingViewPlugin = {
    label: label
}

NewUnits.prototypeViewPlugin = {
    label: label,
    props: sampleSortingViewProps()
}

export default NewUnits