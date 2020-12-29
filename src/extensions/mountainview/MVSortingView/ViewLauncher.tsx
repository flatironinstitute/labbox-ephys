import React, { Fragment, FunctionComponent, useCallback } from 'react';
import { Plugins, RecordingSelection, SortingSelection, SortingUnitViewPlugin, SortingViewPlugin } from '../../extensionInterface';

export type ViewPluginType = 'RecordingView' | 'SortingView' | 'SortingUnitView'

type Props = {
    plugins: Plugins,
    selection: SortingSelection
    recordingSelection: RecordingSelection
    onLaunchSortingView: (plugin: SortingViewPlugin) => void
    onLaunchSortingUnitView: (plugin: SortingUnitViewPlugin, unitId: number, label: string) => void
}

const buttonStyle: React.CSSProperties = {
    fontSize: 11,
    padding: 3,
    margin: 3
}

const ViewLauncher: FunctionComponent<Props> = ({ plugins, onLaunchSortingView, onLaunchSortingUnitView, selection, recordingSelection }) => {
    const sortingUnitViewPlugin = plugins.sortingUnitViews.MVSortingUnitView
    return (
        <Fragment>
            <div key="sortingViews" style={{flexFlow: 'wrap'}}>
                {
                    Object.values(plugins.sortingViews).filter(p => (p.name !== 'MVSortingView')).map(sv => (
                        <LaunchSortingViewButton key={sv.name} plugin={sv} onLaunch={onLaunchSortingView} />
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
            {/* <hr></hr>
            <div key="recordingViews" style={{flexFlow: 'wrap'}}>
                {
                    Object.values(plugins.recordingViews).map(sv => (
                        <LaunchButton key={sv.name} pluginType="RecordingView" plugin={sv} onLaunch={handleLaunch} />
                    ))
                }
            </div> */}
            <hr></hr>
            {
                <div key="view-single-unit">
                {
                    sortingUnitViewPlugin && (selection.selectedUnitIds || []).map(unitId => (
                        <LaunchSortingUnitViewButton key={unitId} plugin={sortingUnitViewPlugin} unitId={unitId} label={`Unit ${unitId}`} onLaunch={onLaunchSortingUnitView} />
                    ))
                }
                </div>
            }
        </Fragment>
    )
}

type LaunchSortingViewButtonProps = {
    plugin: SortingViewPlugin
    onLaunch: (plugin: SortingViewPlugin) => void
}

const LaunchSortingViewButton: FunctionComponent<LaunchSortingViewButtonProps> = ({ plugin, onLaunch }) => {
    const handleClick = useCallback(() => {
        onLaunch(plugin)
    }, [onLaunch, plugin])
    return (
        <button onClick={handleClick} style={buttonStyle}>{plugin.icon && <span style={{paddingRight: 5}}>{plugin.icon}</span>}{plugin.label}</button>
    )
}

type LaunchSortingUnitViewButtonProps = {
    plugin: SortingUnitViewPlugin
    unitId: number
    label: string
    onLaunch: (plugin: SortingUnitViewPlugin, unitId: number, label: string) => void
}

const LaunchSortingUnitViewButton: FunctionComponent<LaunchSortingUnitViewButtonProps> = ({ plugin, unitId, label, onLaunch }) => {
    const handleClick = useCallback(() => {
        onLaunch(plugin, unitId, label)
    }, [onLaunch, plugin, unitId, label])
    return (
        <button onClick={handleClick} style={buttonStyle}>{plugin.icon && <span style={{paddingRight: 5}}>{plugin.icon}</span>}{label}</button>
    )
}

export default ViewLauncher