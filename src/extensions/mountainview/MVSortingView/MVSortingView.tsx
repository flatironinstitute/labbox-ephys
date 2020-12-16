import React, { FunctionComponent, useCallback, useEffect, useReducer } from 'react'
import sizeMe, { SizeMeProps } from 'react-sizeme'
import { Expandable } from '../../../containers/SortingView'
import { defaultSortingCuration, SortingUnitViewPlugin, SortingViewPlugin, SortingViewProps, ViewPlugin } from "../../extensionInterface"
import Splitter from '../../timeseries/TimeWidgetNew/Splitter'
import CurationControl from './CurationControl'
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

const MVSortingView: FunctionComponent<SortingViewProps & SizeMeProps> = (props) => {
    const {plugins, size} = props
    const [openViews, openViewsDispatch] = useReducer(openViewsReducer, [])
    const unitsTablePlugin = plugins.sortingViews.UnitsTable
    useEffect(() => {
        if (openViews.length === 0) {
            if (unitsTablePlugin) {
                openViewsDispatch({
                    type: 'AddView',
                    plugin: unitsTablePlugin,
                    pluginType: 'SortingUnitView',
                    label: unitsTablePlugin.label,
                    area: 'north'
                })
            }
        }
    }, [openViews, openViewsDispatch, unitsTablePlugin])
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
    const width = size.width || 600
    const height = 900 // hard-coded for now
    return (
        <Splitter
            width={width}
            height={height} // hard-coded for now
            initialPosition={initialLeftPanelWidth}
        >
            <div>
                <Expandable label="Launch" defaultExpanded={true}>
                    <ViewLauncher
                        plugins={plugins}
                        onLaunchSortingView={handleLaunchSortingView}
                        onLaunchSortingUnitView={handleLaunchSortingUnitView}
                        selection={props.selection}
                    />
                </Expandable>
                <Expandable label="Curate" defaultExpanded={true}>
                    <CurationControl
                        curation={props.sorting.curation || defaultSortingCuration}
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
                        <ViewWidget key={v.viewId}
                            view={v}
                            sortingViewProps={props}
                        />
                    ))
                }
            </ViewContainer>
        </Splitter>
    )
}

export default sizeMe()(MVSortingView)