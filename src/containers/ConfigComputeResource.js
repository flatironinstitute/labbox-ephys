import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux';
import axios from 'axios';

const ConfigComputeResource = ({
}) => {
    const [status, setStatus] = useState('pending');
    const [errorMessage, setErrorMessage] = useState('');
    const [nodeId, setNodeId] = useState(null);

    const effect = async () => {
        if (status === 'pending') {
            setStatus('running');
            try {
                const url = `/api/kachery/getNodeId`;
                const result = await axios.post(url, {});
                if (!result.data) {
                    setStatus('error');
                    setErrorMessage('result.data is null');
                    return;
                }
                setNodeId(result.data.nodeId);
                setStatus('finished');
            }
            catch (err) {
                setStatus('error');
                setErrorMessage('Error fetching node ID.')
            }
        }
    }
    useEffect(() => {effect()});

    const Content = () => {
        if ((status === 'pending') || (status === 'running')) {
            return <div>Retrieving node ID....</div>;
        }
        else if (status === 'error') {
            return <div>Error: <pre>{errorMessage}</pre></div>;
        }
        else if (status === 'finished') {
            return <div>
                <pre>kachery-p2p node ID: {nodeId}</pre>
            </div>
        }
        else {
            return <div>Unexpected</div>;
        }
    }

    return (
        <div>
            <h1>Compute resource configuration</h1>
            <Content />
        </div>
    )
}


const mapStateToProps = state => ({
})

const mapDispatchToProps = dispatch => ({
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ConfigComputeResource)
