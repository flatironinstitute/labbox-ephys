import React, { useState, useEffect } from 'react';
import NiceTable from '../../components/NiceTable';
import sampleSortingViewProps from '../common/sampleSortingViewProps';
import { sleep } from '../../actions';
import { Button, Paper } from '@material-ui/core';
import { createHitherJob } from '../../hither';
import MultiComboBox from '../../components/MultiComboBox';

const Units = ({ sorting, recording, isSelected, isFocused, onUnitClicked, onAddUnitLabel, onRemoveUnitLabel,
                onSelectedUnitIdsChanged }) => {
    const [activeOptions, setActiveOptions] = useState([]);

    // TODO: it might be worthwhile to add a way to interact with hither using the fetch
    // interface or conventional promises, so that react async can be used to handle
    // rendering of data-store-bound elements.
    // For now we can continue to use the effects hook, like we do for plotting, but it would
    // reduce overhead to use the libraries directly--if I could figure out how...
    const [asyncCallStatus, setAsyncCallStatus] = useState('');
    const [asyncCallError, setAsyncCallError] = useState(null);
    const [queryData, setQueryData] = useState(null);

    const defaultLabelOptions = ['noise', 'MUA', 'artifact', 'accept', 'reject'];
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

    const fetchFiringData = async () => {
        if (!asyncCallStatus) {
            setAsyncCallStatus('running');
            let rateData;
            try {
                setAsyncCallStatus('active');
                await sleep(50);
                rateData = await createHitherJob('get_firing_data',
                {
                    sorting_object: sorting.sortingObject,
                    recording_object: recording.recordingObject
                },
                {
                    auto_substitute_file_objects: true,
                    wait: true,
                    useClientCache: true,
                    hither_config: {
                        use_job_cache: true
                    },
                    job_handler_name: 'calculation'
                });
            }
            catch (err) {
                console.error(err);
                setAsyncCallError(err.message);
                setAsyncCallStatus('error');
                return;
            }
            setQueryData(rateData);
            setAsyncCallStatus('finished');
        }
    }
    useEffect(() => { fetchFiringData(); });

    if (asyncCallStatus === 'pending' || asyncCallStatus === 'active' || asyncCallStatus === 'running') {
        return (
            <div>Loading...</div>
        );
    }
    if (asyncCallStatus === 'error') {
        return (
            <div>Error fetching data: <pre>{asyncCallError}</pre></div>
        )
    }
    if (asyncCallStatus !== 'finished') {
        return (
        <div>ERROR: Unhandled status for async call: {asyncCallStatus}</div>
        )
    }

    // Possible resource:
    //https://ourcodeworld.com/articles/read/317/how-to-check-if-a-javascript-promise-has-been-fulfilled-rejected-or-resolved

    const selectedRowKeys = sorting.sortingInfo.unit_ids
        .reduce((obj, id) => ({...obj, [id]: isSelected(id)}), {});
    const handleSelectedRowKeysChanged = (keys) => {
        onSelectedUnitIdsChanged(
            keys.reduce((o, key) => ({...o, [key]: true}), {})
        );
    }
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

    const rows = sorting.sortingInfo.unit_ids.map(unitId => {
        return {
            key: unitId,
            unitId: unitId,
            labels: {
                element: <span>{getLabelsForUnitId(unitId).join(', ')} </span>
            },
            eventCount: queryData[unitId].count,
            firingRate: queryData[unitId].rate
        }
    });
    
    const columns = [
        {
            key: 'unitId',
            label: 'Unit ID'
        },
        {
            key: 'labels',
            label: 'Labels',
        },
        {
            key: 'eventCount',
            label: 'Num. events',
        },
        {
            key: 'firingRate',
            label: 'Firing rate (Hz)',
        }
    ];
    // TODO: define additional columns such as: num. events, avg. firing rate, snr, ...
    return (
        <div style={{'width': '100%'}}>
            <Paper style={{maxHeight: 350, overflow: 'auto'}}>
            <NiceTable
                rows={rows}
                columns={columns}
                selectionMode='multiple'
                selectedRowKeys={selectedRowKeys}
                onSelectedRowKeysChanged={(keys) => {handleSelectedRowKeysChanged(keys)}}
            />
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

    // return (
    //     // <div style={{'width': '100%'}}>
    //     //     <Async promiseFn={getRateData}>
    //     //         <Async.Loading>Loading...</Async.Loading>
    //     //         <Async.Rejected>{error => `Loading error: ${error.message}`}</Async.Rejected>
    //     //         <Async.Fulfilled>
    //     //             <NiceTable
    //     //                 rows={rows}
    //     //                 columns={columns}
    //     //                 selectionMode='multiple'
    //     //                 selectedRowKeys={selectedRowKeys}
    //     //                 onSelectedRowKeysChanged={(keys) => {handleSelectedRowKeysChanged(keys)}}
    //     //             />
    //     //             <div>
    //     //                 <MultiComboBox
    //     //                     id="label-selection"
    //     //                     label='Choose labels'
    //     //                     placeholder='Add label'
    //     //                     onSelectionsChanged={(event, value) => setActiveOptions(value)}
    //     //                     options={labelOptions}
    //     //                 />
    //     //                 <Button onClick={() => handleApplyLabels(selectedRowKeys, activeOptions)}>Apply selected labels</Button>
    //     //                 <Button onClick={() => handlePurgeLabels(selectedRowKeys, activeOptions)}>Remove selected labels</Button>
    //     //             </div>
    //     //         </Async.Fulfilled>
    //     //     </Async>
    //     // </div>
    //     <Async promiseFn={getRateData}>
    //         {({ data, err, isLoading }) => {
    //             if (isLoading) return "Loading..."
    //             if (err) return `Loading error: ${err.message}`
    //             if (data) return (
    //                 <div style={{'width': '100%'}}>
    //                     <NiceTable
    //                         rows={rows}
    //                         columns={columns}
    //                         selectionMode='multiple'
    //                         selectedRowKeys={selectedRowKeys}
    //                         onSelectedRowKeysChanged={(keys) => {handleSelectedRowKeysChanged(keys)}}
    //                     />
    //                     <div>
    //                         <MultiComboBox
    //                             id="label-selection"
    //                             label='Choose labels'
    //                             placeholder='Add label'
    //                             onSelectionsChanged={(event, value) => setActiveOptions(value)}
    //                             options={labelOptions}
    //                         />
    //                         <Button onClick={() => handleApplyLabels(selectedRowKeys, activeOptions)}>Apply selected labels</Button>
    //                         <Button onClick={() => handlePurgeLabels(selectedRowKeys, activeOptions)}>Remove selected labels</Button>
    //                     </div>
    //                 </div>
    //             )
    //         }}
    //     </Async>
    // );
}

const label = 'Units Table'

Units.sortingViewPlugin = {
    label: label
}

Units.prototypeViewPlugin = {
    label: label,
    props: sampleSortingViewProps()
}

export default Units