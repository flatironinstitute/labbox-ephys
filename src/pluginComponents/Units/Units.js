import React from 'react'
import NiceTable from '../../components/NiceTable'
import sampleSortingViewProps from '../common/sampleSortingViewProps'
import { Button } from '@material-ui/core';

const Units = ({ sorting, recording, isSelected, isFocused, onUnitClicked, onAddUnitLabel, onRemoveUnitLabel,
                onSelectedUnitIdsChanged }) => {
    const selectedRowKeys = sorting.sortingInfo.unit_ids.map((id) => isSelected(id));
    const handleSelectedRowKeysChanged = (keys) => {
        onSelectedUnitIdsChanged(
            keys.reduce((o, key) => Object.assign(o, {[key]: true}), {})
        );
    }
    const defaultLabelOptions = ['noise', 'MUA', 'artifact', 'accept', 'reject'];
    const getLabelsForUnitId = unitId => {
        const unitCuration = sorting.unitCuration || {};
        return (unitCuration[unitId] || {}).labels || ['testing', 'test2'];
    }
    const handleAddLabel = (unitId, label) => {
        onAddUnitLabel({sortingId: sorting.sortingId, unitId: unitId, label: label});
    }
    const handleRemoveLabel = (unitId, label) => {
        onRemoveUnitLabel({sortingId: sorting.sortingId, unitId: unitId, label: label});
    }
    const handleAddExampleLabel = unitId => {
        handleAddLabel(unitId, 'example');
    }
    const handleRemoveExampleLabel = unitId => {
        handleRemoveLabel(unitId, 'example');
    }
    const handleApplyLabel = (selectedRowKeys, label) => {
        selectedRowKeys.forEach((val, idx) => val
            ? handleAddLabel(idx+1, label)
            : {});
    };
    const handlePurgeLabel = (selectedRowKeys, label) => {
        selectedRowKeys.forEach((val, idx) => val
            ? handleRemoveLabel(idx+1, label)
            : {});
    }
    const rows = 
        sorting.sortingInfo.unit_ids.map(unitId => ({
        key: unitId,
        unitId: unitId,
        labels: {
            element: <span>{getLabelsForUnitId(unitId).join(', ')} </span>
        }
    }));
    const columns = [
        {
            key: 'unitId',
            label: 'Unit ID'
        },
        {
            key: 'labels',
            label: 'Labels',
        }
    ];
    // TODO: define additional columns such as: num. events, avg. firing rate, snr, ...
    return (
        <div style={{'width': '100%'}}>
            <NiceTable
                rows={rows}
                columns={columns}
                selectionMode='multiple'
                selectedRowKeys={selectedRowKeys}
                onSelectedRowKeysChanged={(keys) => {handleSelectedRowKeysChanged(keys)}}
            />
            <div>
                <span>
                    <Button onClick={() => handleApplyLabel(selectedRowKeys, 'trial')}>Apply "trial" label</Button>
                    <Button onClick={() => handlePurgeLabel(selectedRowKeys, 'trial')}>Remove "trial" label</Button>
                </span>
            </div>
        </div>
    );
}

const label = 'Units'

Units.sortingViewPlugin = {
    label: label
}

Units.prototypeViewPlugin = {
    label: label,
    props: sampleSortingViewProps()
}

export default Units