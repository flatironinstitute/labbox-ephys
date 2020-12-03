import { Checkbox } from '@material-ui/core';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

const ConfigExtensions = ({
    extensionsConfig,
    extensionContext
}) => {
    const plugins = [];
    Object.values(extensionContext.recordingViews).forEach(sv => {
        plugins.push(sv)
    })
    Object.values(extensionContext.sortingViews).forEach(sv => {
        plugins.push(sv)
    })
    Object.values(extensionContext.sortingUnitViews).forEach(sv => {
        plugins.push(sv)
    })
    Object.values(extensionContext.sortingUnitMetrics).forEach(sv => {
        plugins.push(sv)
    })

    return (
        <div>
            <h3>Plugins:</h3>
            {
                plugins.map(e => (
                    <Fragment key={e.name}>
                        <Checkbox checked={true} onClick={e.onClick} readOnly={true} />
                        {e.label}
                    </Fragment>
                ))
            }
        </div>
    )
}

const mapStateToProps = state => ({
    extensionsConfig: state.extensionsConfig,
    extensionContext: state.extensionContext
})

const mapDispatchToProps = dispatch => ({
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ConfigExtensions)
