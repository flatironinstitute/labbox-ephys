import { Checkbox } from '@material-ui/core';
import React, { Dispatch, Fragment, FunctionComponent } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { useLabboxPlugins } from '../extensions/labbox';
import { LabboxPlugin, recordingViewPlugins, sortingUnitMetricPlugins, sortingUnitViewPlugins, sortingViewPlugins } from '../extensions/pluginInterface';
import { ExtensionsConfig } from '../extensions/reducers';
import { RootAction, RootState } from '../reducers';

interface StateProps {
    extensionsConfig: ExtensionsConfig
}

interface DispatchProps {
}

interface OwnProps {
}

type Props = StateProps & DispatchProps & OwnProps

const ConfigExtensions: FunctionComponent<Props> = ({ extensionsConfig }) => {
    const plugins = useLabboxPlugins<LabboxPlugin>()
    return (
        <div>
            <PluginsList plugins={recordingViewPlugins(plugins)} heading="Recording view plugins" />
            <PluginsList plugins={sortingViewPlugins(plugins)} heading="Sorting view plugins" />
            <PluginsList plugins={sortingUnitViewPlugins(plugins)} heading="Sorting unit view plugins" />
            <PluginsList plugins={sortingUnitMetricPlugins(plugins)} heading="Sorting unit metric plugins" />
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
    extensionsConfig: state.extensionsConfig
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(ConfigExtensions)