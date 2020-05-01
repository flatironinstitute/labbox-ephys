import React from 'react'
import { connect } from 'react-redux'
import NiceTable from '../components/NiceTable'
import { deleteSortings } from '../actions';
import { Link } from 'react-router-dom';

const SortingsTable = ({ sortings, onDeleteSortings, recordingId }) => {

    function sortByKey(array, key) {
        return array.sort(function (a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

    if (recordingId) {
        sortings = sortings.filter(s => (s.recordingId === recordingId))
    }
    sortings = sortByKey(sortings, 'sortingId');

    const rows = sortings.map(s => ({
        sorting: s,
        key: s.sortingId,
        sortingId: {
            text: s.sortingId,
            element: <Link title={"View this sorting"} to={`/sorting/${s.sortingId}`}>{s.sortingId}</Link>,
        },
        numUnits: s.sortingInfo.unit_ids.length
    }));

    const columns = [
        {
            key: 'sortingId',
            label: 'Sorting'
        },
        {
            key: 'numUnits',
            label: 'Num. units'
        }
    ]

    return (
        <div>
            <NiceTable
                rows={rows}
                columns={columns}
                deleteRowLabel={"Remove this sorting"}
                onDeleteRow={(row) => onDeleteSortings([row.sorting.sortingId])}
            />
        </div>
    );
}

const mapStateToProps = state => ({
    sortings: state.sortings
})

const mapDispatchToProps = dispatch => ({
    onDeleteSortings: sortingIds => dispatch(deleteSortings(sortingIds))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SortingsTable)
