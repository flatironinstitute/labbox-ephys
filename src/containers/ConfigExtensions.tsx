import { Checkbox } from '@material-ui/core';
import React, { Fragment, FunctionComponent } from 'react';
import { useLabboxPlugins } from '../extensions/labbox';
import { LabboxPlugin, recordingViewPlugins, sortingUnitMetricPlugins, sortingUnitViewPlugins, sortingViewPlugins } from '../extensions/pluginInterface';

type Props = {}

const ConfigExtensions: FunctionComponent<Props> = () => {
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

export default ConfigExtensions