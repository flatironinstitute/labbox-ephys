import React from 'react'
import { connect } from 'react-redux'
import NiceTable from '../components/NiceTable'
import { cancelSortingJobs } from '../actions';
import { Link } from 'react-router-dom';
import { getPathQuery } from '../kachery';

const SortingJobsTable = ({ sortingJobs, onCancelSortingJobs, documentInfo }) => {
    const { documentId, feedUri, readonly } = documentInfo;

    function sortByKey(array, key) {
        return array.sort(function (a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

    sortingJobs = sortByKey(sortingJobs, 'sortingJobId');

    const rows = sortingJobs.map(s => ({
        sortingJob: s,
        key: s.sortingJobId,
        algorithm: {
            text: s.sorter.algorithm,
            element: <Link title={"View this sorting job"} to={`/${documentId}/sortingJob/${s.sortingJobId}${getPathQuery({feedUri})}`}>{s.sorter.algorithm}</Link>,
        },
        recording: s.recordingId,
        status: s.status
    }));

    const columns = [
        {
            key: 'algorithm',
            label: 'Algorithm'
        },
        {
            key: 'recording',
            label: 'Recording'
        },
        {
            key: 'status',
            label: 'Status'
        }
    ]

    return (
        <div>
            <NiceTable
                rows={rows}
                columns={columns}
                deleteRowLabel={"Cancel this sorting job"}
                onDeleteRow={(row) => onCancelSortingJobs([row.sortingJob.sortingJobId])}
            />
        </div>
    );
}

const mapStateToProps = (state, ownProps) => (
    {
        sortingJobs: ownProps.sortingJobs || state.sortingJobs,
        documentInfo: state.documentInfo
    }
)

const mapDispatchToProps = dispatch => ({
    onCancelSortingJobs: sortingJobIds => dispatch(cancelSortingJobs(sortingJobIds))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SortingJobsTable)
