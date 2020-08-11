import React, { Fragment } from 'react'
import { connect } from 'react-redux';
import { setExtensionEnabled } from '../actions';
import { Checkbox } from '@material-ui/core';

const ConfigExtensions = ({
    extensionsConfig,
    onSetExtensionEnabled
}) => {
    const extensions = [];
    extensions.push({
        label: 'Development',
        enabled: extensionsConfig.enabled.development === true,
        onClick: () => onSetExtensionEnabled('development', !extensionsConfig.enabled.development)
    });
    extensions.push({
        label: 'FrankLab DataJoint',
        enabled: extensionsConfig.enabled.frankLabDataJoint === true,
        onClick: () => onSetExtensionEnabled('frankLabDataJoint', !extensionsConfig.enabled.frankLabDataJoint)
    });

    return (
        <div>
            {
                extensions.map(e => (
                    <Fragment key={e.label}>
                        <Checkbox checked={e.enabled} onClick={e.onClick} />
                        {e.label}
                    </Fragment>
                ))
            }
        </div>
    )
}

const mapStateToProps = state => ({
    extensionsConfig: state.extensionsConfig
})

const mapDispatchToProps = dispatch => ({
    onSetExtensionEnabled: (extensionName, value) => dispatch(setExtensionEnabled(extensionName, value))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ConfigExtensions)
