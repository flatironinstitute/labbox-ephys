import { Checkbox } from '@material-ui/core';
import React, { Dispatch, Fragment, FunctionComponent } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { LabboxPlugin, Plugins } from '../extensions/extensionInterface';
import { ExtensionsConfig } from '../extensions/reducers';
import { RootAction, RootState } from '../reducers';

interface StateProps {
    extensionsConfig: ExtensionsConfig
    plugins: Plugins
}

interface DispatchProps {
}

interface OwnProps {
}

type Props = StateProps & DispatchProps & OwnProps

const ConfigExtensions: FunctionComponent<Props> = ({ plugins, extensionsConfig }) => {
    const allPlugins: LabboxPlugin[] = [];
    Object.values(plugins.recordingViews).forEach(p => {
        allPlugins.push(p)
    })
    Object.values(plugins.sortingViews).forEach(p => {
        allPlugins.push(p)
    })
    Object.values(plugins.sortingUnitViews).forEach(p => {
        allPlugins.push(p)
    })
    Object.values(plugins.sortingUnitMetrics).forEach(p => {
        allPlugins.push(p)
    })

    return (
        <div>
            <PluginsList plugins={Object.values(plugins.recordingViews)} heading="Recording view plugins" />
            <PluginsList plugins={Object.values(plugins.sortingViews)} heading="Sorting view plugins" />
            <PluginsList plugins={Object.values(plugins.sortingUnitViews)} heading="Sorting unit view plugins" />
            <PluginsList plugins={Object.values(plugins.sortingUnitMetrics)} heading="Sorting unit metric plugins" />
        </div>
    )
}

const PluginsList: FunctionComponent<{plugins: LabboxPlugin[], heading: string}> = ({ plugins, heading }) => {
    return (
        <div>
        <h3>Sorting view plugins:</h3>
            {
                plugins.map(p => (
                    <Fragment key={p.name}>
                        <Checkbox checked={true} onClick={() => {}} readOnly={true} />
                        {p.label}
                    </Fragment>
                ))
            }
        </div>
    )
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
    plugins: state.plugins,
    extensionsConfig: state.extensionsConfig
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(ConfigExtensions)