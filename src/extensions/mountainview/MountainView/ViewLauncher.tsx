import React, { Fragment, FunctionComponent, useCallback } from 'react';
import { Plugins, ViewPlugin } from '../../extensionInterface';

export type ViewPluginType = 'RecordingView' | 'SortingView' | 'SortingUnitView'

type Props = {
    plugins: Plugins,
    onLaunch?: (pluginType: ViewPluginType, plugin: ViewPlugin) => void
}

const buttonStyle: React.CSSProperties = {
    fontSize: 11,
    padding: 3,
    margin: 3
}

const ViewLauncher: FunctionComponent<Props> = ({ plugins, onLaunch }) => {
    const handleLaunch = useCallback((pluginType: ViewPluginType, plugin: ViewPlugin) => {
        onLaunch && onLaunch(pluginType, plugin)
    }, [onLaunch])
    return (
        <Fragment>
            <div key="sortingViews" style={{flexFlow: 'wrap'}}>
                {
                    Object.values(plugins.sortingViews).map(sv => (
                        <LaunchButton key={sv.name} pluginType="SortingView" plugin={sv} onLaunch={handleLaunch} />
                    ))
                }
            </div>
            {/* <hr></hr>
            <div key="sortingUnitViews" style={{flexFlow: 'wrap'}}>
                {
                    Object.values(plugins.sortingUnitViews).map(sv => (
                        <LaunchButton key={sv.name} pluginType="SortingUnitView" plugin={sv} onLaunch={handleLaunch} />
                    ))
                }
            </div> */}
            <hr></hr>
            <div key="recordingViews" style={{flexFlow: 'wrap'}}>
                {
                    Object.values(plugins.recordingViews).map(sv => (
                        <LaunchButton key={sv.name} pluginType="RecordingView" plugin={sv} onLaunch={handleLaunch} />
                    ))
                }
            </div>
        </Fragment>
    )
}

type LaunchButtonProps = {
    pluginType: ViewPluginType
    plugin: ViewPlugin
    onLaunch: (pluginType: ViewPluginType, plugin: ViewPlugin) => void
}

const LaunchButton: FunctionComponent<LaunchButtonProps> = ({ pluginType, plugin, onLaunch }) => {
    const handleClick = useCallback(() => {
        onLaunch(pluginType, plugin)
    }, [])
    return (
        <button onClick={handleClick} style={buttonStyle}>{plugin.label}</button>
    )
}

export default ViewLauncher