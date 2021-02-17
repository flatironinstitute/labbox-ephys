// react
import { MuiThemeProvider } from '@material-ui/core';
import { createExtensionContext, LabboxProvider, WorkspaceInfo } from 'labbox';
import QueryString from 'querystring';
import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import "../node_modules/react-vis/dist/style.css";
import AppContainer from './AppContainer';
import config from './config.json';
import { LabboxPlugin } from './extensions/pluginInterface';
import theme from './extensions/theme';
import { LocationInterface } from './extensions/WorkspaceView/WorkspaceView';
import './index.css';
import registerExtensions from './registerExtensions';
import * as serviceWorker from './serviceWorker';
import './styles.css';

const extensionContext = createExtensionContext<LabboxPlugin>()
registerExtensions(extensionContext)

const useWorkspaceInfo = (location: LocationInterface): WorkspaceInfo => {
  const { workspaceName, feedUri, readOnly } = useMemo(() => {
      const pathList = location.pathname.split('/')
      const { workspaceName}: {page?: string, workspaceName?: string} = (
          (['docs', 'about'].includes(pathList[1])) ? ({
              workspaceName: 'default',
              page: pathList[1]
          }) : ({
              workspaceName: pathList[1] || 'default',
              page: pathList[2] || ''
          })
      )
      const query = QueryString.parse(location.search.slice(1));
      const feedUri = (query.feed as string) || null
      const readOnly = ((feedUri) && (feedUri.startsWith('sha1://'))) ? true : false;
      return {
          workspaceName,
          feedUri,
          readOnly
      }
  }, [location.pathname, location.search])

  // important to do it this way so we don't get a new object every time location.pathname changes
  return useMemo(() => ({
      workspaceName, feedUri, readOnly
  }), [workspaceName, feedUri, readOnly])
}

const apiConfig = {
  webSocketUrl: `ws://${window.location.hostname}:${config.webSocketPort}`,
  baseSha1Url: `http://${window.location.hostname}:${config.httpPort}/sha1`
}

const Content = () => {
  const location = useLocation()
  const workspaceInfo = useWorkspaceInfo(location)
  return (
    // <React.StrictMode> // there's an annoying error when strict mode is enabled. See for example: https://github.com/styled-components/styled-components/issues/2154   
    <MuiThemeProvider theme={theme}>
      <LabboxProvider
        extensionContext={extensionContext}
        workspaceInfo={workspaceInfo}
        apiConfig={apiConfig}
      >
        <AppContainer />
      </LabboxProvider>
    </MuiThemeProvider>
    // </React.StrictMode>
  )
}

const content = (
  <Router>
    <Content />
  </Router>
)

// Render the app
ReactDOM.render(
  content,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();