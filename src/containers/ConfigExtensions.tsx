import { Checkbox } from '@material-ui/core';
import React, { Dispatch, Fragment, FunctionComponent } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { LabboxPlugin } from '../extension';
import { ExtensionsConfig } from '../extensions/reducers';
import { RootAction, RootState } from '../reducers';
import { State as ExtensionContext } from '../reducers/extensionContext';

interface StateProps {
    extensionsConfig: ExtensionsConfig
    extensionContext: ExtensionContext
}

interface DispatchProps {
}

interface OwnProps {
}

type Props = StateProps & DispatchProps & OwnProps

const ConfigExtensions: FunctionComponent<Props> = ({ extensionContext, extensionsConfig }) => {
    const plugins: LabboxPlugin[] = [];
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
                        <Checkbox checked={true} onClick={() => {}} readOnly={true} />
                        {e.label}
                    </Fragment>
                ))
            }
        </div>
    )
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
    extensionContext: state.extensionContext,
    extensionsConfig: state.extensionsConfig
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(ConfigExtensions)