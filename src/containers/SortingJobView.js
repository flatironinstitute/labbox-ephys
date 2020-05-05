import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom';

const SortingJobView = ({ sortingJobId, sortingJob }) => {
  if (!sortingJob) {
    return <h3>{`Sorting job not found: ${sortingJobId}`}</h3>
  }

  return (
    <div>
      <h1>Sorting job</h1>
      <pre>{JSON.stringify(sortingJob, null, 4)}</pre>
    </div>
  )
}

const mapStateToProps = (state, ownProps) => ({
  // todo: use selector
  sortingJob: state.sortingJobs.filter(j => (j.sortingJobId === ownProps.sortingJobId))[0]
})

const mapDispatchToProps = dispatch => ({
})

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(SortingJobView))
