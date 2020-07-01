import React, { useState } from 'react'
import NiceTable from '../../components/NiceTable'
import sampleSortingViewProps from '../common/sampleSortingViewProps'
import { Button } from '@material-ui/core';
import MultiComboBox from '../../components/MultiComboBox';

const Units = ({ sorting, recording, isSelected, isFocused, onUnitClicked, onAddUnitLabel, onRemoveUnitLabel,
                onSelectedUnitIdsChanged }) => {
    const [activeOptions, setActiveOptions] = useState([]);

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

    const selectedRowKeys = sorting.sortingInfo.unit_ids.map((id) => isSelected(id));
    const handleSelectedRowKeysChanged = (keys) => {
        onSelectedUnitIdsChanged(
            keys.reduce((o, key) => Object.assign(o, {[key]: true}), {})
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
        selectedRowKeys.forEach((val, idx) => val
            ? labels.forEach((label) => handleAddLabel(idx+1, label))
            : {});
    };
    const handlePurgeLabels = (selectedRowKeys, labels) => {
        selectedRowKeys.forEach((val, idx) => val
            ? labels.forEach((label) => handleRemoveLabel(idx+1, label))
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

const label = 'Units'

Units.sortingViewPlugin = {
    label: label
}

Units.prototypeViewPlugin = {
    label: label,
    props: sampleSortingViewProps()
}

export default Units