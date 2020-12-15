import React, { FunctionComponent, useCallback, useReducer } from 'react'
import sizeMe, { SizeMeProps } from 'react-sizeme'
import { Expandable } from '../../../containers/SortingView'
import { defaultSortingCuration, SortingViewProps, ViewPlugin } from "../../extensionInterface"
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
}

type CloseViewAction = {
    type: 'CloseView'
    view: View
}

export class View {
    activate: boolean = false // signal to set this tab as active
    constructor(public pluginType: ViewPluginType, public plugin: ViewPlugin, public viewId: number) {

    }

}

type OpenViewsAction = AddViewAction | CloseViewAction

let lastViewId: number = 0
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
        lastViewId ++
        const v = new View(action.pluginType, plugin, lastViewId)
        v.activate = true // signal to set this as active
        return [...state, v]
    }
    else if (action.type === 'CloseView') {
        return state.filter(v => (v !== action.view))
    }
    else return state
}

const MountainView: FunctionComponent<SortingViewProps & SizeMeProps> = (props) => {
    const {plugins, size} = props
    const [openViews, openViewsDispatch] = useReducer(openViewsReducer, [])
    const handleLaunchView = useCallback((pluginType: ViewPluginType, plugin: ViewPlugin) => {
        openViewsDispatch({
            type: 'AddView',
            pluginType,
            plugin
        })
    }, [])
    const handleViewClosed = useCallback((v: View) => {
        openViewsDispatch({
            type: 'CloseView',
            view: v
        })
    }, [openViewsDispatch])
    return (
        <Splitter
            width={size.width || 600}
            height={900} // hard-coded for now
            initialPosition={initialLeftPanelWidth}
        >
            <div>
                <Expandable label="Launch" defaultExpanded={true}>
                    <ViewLauncher
                        plugins={plugins}
                        onLaunch={handleLaunchView}
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
                views={openViews}
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

export default sizeMe()(MountainView)