import { MuiThemeProvider } from '@material-ui/core';
import { LabboxProviderContext, usePlugins } from 'labbox';
import QueryString from 'querystring';
import React, { useCallback, useContext, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import './App.css';
import { LabboxPlugin, MainWindowPlugin, WorkspaceRoute } from './python/labbox_ephys/extensions/pluginInterface';
import { locationFromRoute, routeFromLocation, WorkspaceRouteAction, workspaceRouteReducer } from './python/labbox_ephys/extensions/pluginInterface/WorkspaceRoute';
import theme from './python/labbox_ephys/extensions/theme';

function App() {
  const plugins = usePlugins<LabboxPlugin>()
  const mainWindowPlugin = plugins.filter(p => (p.name === 'MainWindow'))[0] as any as MainWindowPlugin
  if (!mainWindowPlugin) throw Error('Unable to find main window plugin.')

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
        history.push({...location, ...newLocation})
      }
    },
    [workspaceRoute, history, location]
  )

  return (
    <MuiThemeProvider theme={theme}>
      <div className="App">
        <header className="App-header">
          <mainWindowPlugin.component
            {...{workspaceUri, workspaceRoute, workspaceRouteDispatch}}
          />
        </header>
      </div>
    </MuiThemeProvider>
  );
}

export default App;
