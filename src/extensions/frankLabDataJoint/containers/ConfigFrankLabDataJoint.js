import React, { useState, Fragment } from 'react'
import TextInputControl from '../../../components/TextInputControl';
import { Button } from '@material-ui/core';
import { setFrankLabDataJointConfig } from '../actions'
import { connect } from 'react-redux';

const ConfigFrankLabDataJoint = ({
    frankLabDataJointConfig, onSetFrankLabDataJointConfig
}) => {
    const [port, setPort] = useState(frankLabDataJointConfig.port);
    const [user, setUser] = useState(frankLabDataJointConfig.user);
    const [password, setPassword] = useState(frankLabDataJointConfig.password);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSubmit = () => {
        if (!isValidPort(port)) {
            setErrorMessage('Invalid port.');
            return;
        }
        setErrorMessage('');
        onSetFrankLabDataJointConfig({
            port: Number(port),
            user,
            password
        })
    }

    const somethingChanged = (
        ((port + '' || '') !== (frankLabDataJointConfig.port + '' || '')) ||
        ((user || '') !== (frankLabDataJointConfig.user || '')) ||
        ((password || '') !== (frankLabDataJointConfig.password || '') )
    )

    return (
        <div>
            <TextInputControl
                label="Port"
                value={port || ''}
                onSetValue={setPort}
            />
            <div style={{ paddingBottom: 15 }} />
            <TextInputControl
                label="User"
                value={user}
                onSetValue={setUser}
            />
            <div style={{ paddingBottom: 15 }} />
            <TextInputControl
                label="Password"
                type="password"
                value={password}
                onSetValue={setPassword}
            />
            <div className="invalid-feedback">{errorMessage}</div>
            <Button color="primary" disabled={!somethingChanged} onClick={handleSubmit}>Submit</Button>
        </div>
    )    
}

function isValidPort(port) {
    if (!port) return true;
    return Number(port) + '' === port + '';
}

const mapStateToProps = state => ({
    frankLabDataJointConfig: state.extensionsConfig.frankLabDataJoint.config
})

const mapDispatchToProps = dispatch => ({
    onSetFrankLabDataJointConfig: config => dispatch(setFrankLabDataJointConfig(config))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ConfigFrankLabDataJoint)
