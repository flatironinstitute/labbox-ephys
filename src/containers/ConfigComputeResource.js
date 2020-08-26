import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux';

const ConfigComputeResource = ({nodeId}) => {
    const Content = () => {
        return <div>
            <pre>kachery-p2p node ID: {nodeId}</pre>
        </div>
    }

    return (
        <div>
            <h1>Compute resource configuration</h1>
            <Content />
        </div>
    )
}


const mapStateToProps = state => ({
    nodeId: state.serverInfo.nodeId
})

const mapDispatchToProps = dispatch => ({
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ConfigComputeResource)
