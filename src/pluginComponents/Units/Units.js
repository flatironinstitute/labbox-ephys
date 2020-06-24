import React from 'react'
import NiceTable from '../../components/NiceTable'
import sampleSortingViewProps from '../common/sampleSortingViewProps'

const Units = ({ sorting, recording, isSelected, isFocused, onUnitClicked }) => {
    const selectedRowKeys = []; // TODO: define this based on isSelected
    const handleSelectedRowKeysChanged = (keys) => {
        // todo: we need an additional callback to set the selected unit ids
    }
    const rows = sorting.sortingInfo.unit_ids.map(unitId => ({
        key: unitId,
        unitId: unitId,
    }))
    const columns = [
        {
            key: 'unitId',
            label: 'Unit ID'
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