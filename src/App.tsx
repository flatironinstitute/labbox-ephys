import { MuiThemeProvider } from '@material-ui/core';
import { LabboxProviderContext, usePlugins, useSubfeed } from 'labbox';
import QueryString from 'querystring';
import React, { useCallback, useContext, useMemo, useReducer } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import './App.css';
import { LabboxPlugin, MainWindowPlugin, WorkspaceRoute } from './python/labbox_ephys/extensions/pluginInterface';
import { parseWorkspaceUri } from './python/labbox_ephys/extensions/pluginInterface/misc';
import workspaceReducer, { WorkspaceAction } from './python/labbox_ephys/extensions/pluginInterface/workspaceReducer';
import { locationFromRoute, routeFromLocation, WorkspaceRouteAction, workspaceRouteReducer } from './python/labbox_ephys/extensions/pluginInterface/WorkspaceRoute';
import theme from './python/labbox_ephys/extensions/theme';

function App({ version }: { version: string }) {
  const plugins = usePlugins<LabboxPlugin>()
  const mainWindowPlugin = plugins.filter(p => (p.name === 'MainWindow'))[0] as any as MainWindowPlugin

  const { serverInfo } = useContext(LabboxProviderContext)

  const location = useLocation()
  const history = useHistory()
  const workspaceUri = useMemo(() => {
    const query = QueryString.parse(location.search.slice(1));
    const workspace = (query.workspace as string) || 'default'
    const defaultFeedId = serverInfo?.defaultFeedId
    const workspaceUri = workspace.startsWith('workspace://') ? workspace : (defaultFeedId ? `workspace://${defaultFeedId}/${workspace}` : undefined)
    return workspaceUri
  }, [location.search, serverInfo])

  const workspaceRoute: WorkspaceRoute = useMemo(() => {
    return routeFromLocation(location, serverInfo)
  }, [location, serverInfo])

  // const [workspaceRoute, workspaceRouteDispatch] = useReducer(workspaceRouteReducer, {page: 'main'})

  const workspaceRouteDispatch = useCallback(
    (a: WorkspaceRouteAction) => {
      const newRoute: WorkspaceRoute = workspaceRouteReducer(workspaceRoute, a)
      const newLocation = locationFromRoute(newRoute)
      if ((location.pathname !== newLocation.pathname) || (location.search !== newLocation.search)) {
        history.push({ ...location, ...newLocation })
      }
    },
    [workspaceRoute, history, location]
  )

  const [workspace, workspaceDispatch2] = useReducer(workspaceReducer, useMemo(() => ({ recordings: [], sortings: [] }), []))
  const handleWorkspaceSubfeedMessages = useCallback((messages: any[]) => {
    messages.filter(msg => msg.action).forEach(msg => workspaceDispatch2(msg.action))
  }, [])

  const { feedUri } = parseWorkspaceUri(workspaceUri)

  const subfeedName = 'main'

  const { appendMessages: appendWorkspaceMessages } = useSubfeed({ feedUri, subfeedName, onMessages: handleWorkspaceSubfeedMessages })
  const workspaceDispatch = useCallback((a: WorkspaceAction) => {
    appendWorkspaceMessages([{ action: a }])
  }, [appendWorkspaceMessages])

  return (
    <MuiThemeProvider theme={theme}>
      <div className="App">
        <header className="App-header">
          {
            mainWindowPlugin ? (
              <mainWindowPlugin.component
                {...{ workspace, workspaceDispatch, workspaceRoute, workspaceRouteDispatch, version }}
              />
            ) : (<div>No main window plugin</div>)
          }
        </header>
      </div>
    </MuiThemeProvider>
  );
}

export default App;
