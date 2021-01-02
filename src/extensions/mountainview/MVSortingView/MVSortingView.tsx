import { faSquare } from '@fortawesome/free-regular-svg-icons'
import { faPencilAlt, faSocks } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import Splitter from '../../common/Splitter'
import { SortingUnitViewPlugin, SortingViewPlugin, SortingViewProps, ViewPlugin } from "../../extensionInterface"
import Expandable from '../../old/curation/CurationSortingView/Expandable'
import '../mountainview.css'
import CurationControl from './CurationControl'
import FilterControl, { filterSelectionReducer } from './FilterControl'
import ViewContainer from './ViewContainer'
import ViewLauncher, { ViewPluginType } from './ViewLauncher'
import ViewWidget from './ViewWidget'

const initialLeftPanelWidth = 320

type AddViewAction = {
    type: 'AddView'
    pluginType: ViewPluginType
    plugin: ViewPlugin
    label: string
    area: 'north' | 'south' | ''
    extraProps?: {[key: string]: any}
}

type CloseViewAction = {
    type: 'CloseView'
    view: View
}

type SetViewAreaAction = {
    type: 'SetViewArea'
    viewId: string
    area: 'north' | 'south'
}

export class View {
    activate: boolean = false // signal to set this tab as active
    area: 'north' | 'south' | '' = ''
    constructor(public pluginType: ViewPluginType, public plugin: ViewPlugin, public extraProps: {[key: string]: any}, public label: string, public viewId: string) {

    }

}

type OpenViewsAction = AddViewAction | CloseViewAction | SetViewAreaAction

let lastViewIdNum: number = 0
export const openViewsReducer: React.Reducer<View[], OpenViewsAction> = (state: View[], action: OpenViewsAction): View[] => {
    if (action.type === 'AddView') {
        const plugin = action.plugin
        if (plugin.singleton) {
            for (let v0 of state) {
                if (v0.plugin.name === plugin.name) {
                    v0.activate = true
                    return [...state]
                }
            }
        }
        lastViewIdNum ++
        const v = new View(action.pluginType, plugin, action.extraProps || {}, action.label, lastViewIdNum + '')
        v.activate = true // signal to set this as active
        v.area = action.area
        return [...state, v].sort((a, b) => (a.plugin.label > b.plugin.label ? 1 : a.plugin.label < b.plugin.label ? -1 : 0))
    }
    else if (action.type === 'CloseView') {
        return state.filter(v => (v !== action.view))
    }
    else if (action.type === 'SetViewArea') {
        return state.map(v => (v.viewId === action.viewId ? {...v, area: action.area, activate: true} : v))
    }
    else return state
}

const MVSortingView: FunctionComponent<SortingViewProps> = (props) => {
    const {plugins, recording} = props
    const [openViews, openViewsDispatch] = useReducer(openViewsReducer, [])
    const unitsTablePlugin = plugins.sortingViews.UnitsTable
    const averageWaveformsPlugin = plugins.sortingViews.AverageWaveforms
    const electrodeGeometryPlugin = plugins.sortingViews.ElectrodeGeometrySortingView
    const [initialized, setInitialized] = useState(false)
    useEffect(() => {
        if ((openViews.length === 0) && (!initialized)) {
            setInitialized(true)
            // if (electrodeGeometryPlugin) {
            //     openViewsDispatch({
            //         type: 'AddView',
            //         plugin: electrodeGeometryPlugin,
            //         pluginType: 'SortingUnitView',
            //         label: electrodeGeometryPlugin.label,
            //         area: 'north'
            //     })
            // }
            if (unitsTablePlugin) {
                openViewsDispatch({
                    type: 'AddView',
                    plugin: unitsTablePlugin,
                    pluginType: 'SortingUnitView',
                    label: unitsTablePlugin.label,
                    area: 'north'
                })
            }
            if (averageWaveformsPlugin) {
                openViewsDispatch({
                    type: 'AddView',
                    plugin: averageWaveformsPlugin,
                    pluginType: 'SortingUnitView',
                    label: averageWaveformsPlugin.label,
                    area: 'south'
                })
            }
        }
    }, [openViews, openViewsDispatch, electrodeGeometryPlugin, unitsTablePlugin, averageWaveformsPlugin])
    const handleLaunchSortingView = useCallback((plugin: SortingViewPlugin) => {
        openViewsDispatch({
            type: 'AddView',
            pluginType: 'SortingView',
            plugin,
            label: plugin.label,
            area: ''
        })
    }, [openViewsDispatch])
    const handleLaunchSortingUnitView = useCallback((plugin: SortingUnitViewPlugin, unitId: number, label: string) => {
        openViewsDispatch({
            type: 'AddView',
            pluginType: 'SortingUnitView',
            plugin,
            label,
            area: '',
            extraProps: {unitId}
        })
    }, [openViewsDispatch])
    const handleViewClosed = useCallback((v: View) => {
        openViewsDispatch({
            type: 'CloseView',
            view: v
        })
    }, [openViewsDispatch])
    const handleSetViewArea = useCallback((view: View, area: 'north' | 'south') => {
        openViewsDispatch({
            type: 'SetViewArea',
            viewId: view.viewId,
            area
        })
    }, [openViewsDispatch])
    const width = props.width || 600
    const height = props.height || 900
    const filterIcon = <span style={{color: 'gray'}}><FontAwesomeIcon icon={faSocks} type="outline" /></span>
    const launchIcon = <span style={{color: 'gray'}}><FontAwesomeIcon icon={faSquare} type="outline" /></span>
    const curationIcon = <span style={{color: 'gray'}}><FontAwesomeIcon icon={faPencilAlt} /></span>

    const [filterSelection, filterSelectionDispatch] = useReducer(filterSelectionReducer, {filterType: 'none'})

    const filteredRecording = useMemo(() => {
        if (!recording) return recording
        if (filterSelection.filterType === 'none') {
            return recording
        }
        else if (filterSelection.filterType === 'bandpass_filter') {
            return {
                ...recording,
                recordingObject: {
                    recording_format: 'filtered',
                    data: {
                        filters: [{type: 'bandpass_filter', freq_min: 300, freq_max: 3000, freq_wid: 1000}],
                        recording: recording.recordingObject
                    }
                }
            }
        }
        else {
            throw Error(`Unexpected filter type: ${filterSelection.filterType}`)
        }
    }, [recording, filterSelection])

    const sortingViewProps = {...props, recording: filteredRecording}
    return (
        <div className="MVSortingView">
            <Splitter
                width={width}
                height={height}
                initialPosition={initialLeftPanelWidth}
            >
                <div>
                    <Expandable icon={filterIcon} label="Filter" defaultExpanded={true}>
                        <FilterControl
                            filterSelection={filterSelection}
                            filterSelectionDispatch={filterSelectionDispatch}
                        />
                    </Expandable>
                    <Expandable icon={launchIcon} label="Launch" defaultExpanded={true}>
                        <ViewLauncher
                            plugins={plugins}
                            onLaunchSortingView={handleLaunchSortingView}
                            onLaunchSortingUnitView={handleLaunchSortingUnitView}
                            selection={props.selection}
                        />
                    </Expandable>
                    <Expandable icon={curationIcon} label="Curation" defaultExpanded={true}>
                        <CurationControl
                            curation={props.sorting.curation || {}}
                            curationDispatch={props.curationDispatch}
                            selection={props.selection}
                            selectionDispatch={props.selectionDispatch}
                        />
                    </Expandable>
                </div>
                <ViewContainer
                    onViewClosed={handleViewClosed}
                    onSetViewArea={handleSetViewArea}
                    views={openViews}
                    width={0} // will be replaced by splitter
                    height={0} // will be replaced by splitter
                >
                    {
                        openViews.map(v => (
                            <ViewWidget
                                key={v.viewId}
                                view={v}
                                sortingViewProps={sortingViewProps}
                            />
                        ))
                    }
                </ViewContainer>
            </Splitter>
        </div>
    )
}

export default MVSortingView