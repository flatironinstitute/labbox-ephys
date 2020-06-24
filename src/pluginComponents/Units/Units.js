import React from 'react'
import NiceTable from '../../components/NiceTable'
import sampleSortingViewProps from '../common/sampleSortingViewProps'
import { Button } from '@material-ui/core';

const Units = ({ sorting, recording, isSelected, isFocused, onUnitClicked, onAddUnitLabel, onRemoveUnitLabel }) => {
    const selectedRowKeys = []; // TODO: define this based on isSelected
    const handleSelectedRowKeysChanged = (keys) => {
        // todo: we need an additional callback to set the selected unit ids
    }
    const getLabelsForUnitId = unitId => {
        const unitCuration = sorting.unitCuration || {};
        return (unitCuration[unitId] || {}).labels || ['testing', 'test2'];
    }
    const handleAddExampleLabel = unitId => {
        onAddUnitLabel({sortingId: sorting.sortingId, unitId: unitId, label: 'example'});
    }
    const rows = sorting.sortingInfo.unit_ids.map(unitId => ({
        key: unitId,
        unitId: unitId,
        labels: {
            element: <span>{getLabelsForUnitId(unitId).join(', ')} <Button onClick={() => handleAddExampleLabel(unitId)}>Add example label</Button></span>
        }
    }))
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
    // todo: define additional columns such as: num. events, avg. firing rate, snr, ...
    return (
        <NiceTable
            rows={rows}
            columns={columns}
            selectionMode='multiple'
            selectedRowKeys={selectedRowKeys}
            onSelectedRowKeysChanged={(keys) => {handleSelectedRowKeysChanged(keys)}}
        />
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