import React from 'react'
import { connect } from 'react-redux'
import AddComputeResource from './AddComputeResource';

const EditComputeResource = ({ onDone, computeResource }) => {
    return (
      <AddComputeResource
        onDone={onDone}
        oldComputeResource={computeResource}
      />
    )
}

const mapStateToProps = state => ({
})

const mapDispatchToProps = dispatch => ({
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditComputeResource)
