// react
import { MuiThemeProvider } from '@material-ui/core';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
// router
import { BrowserRouter as Router } from 'react-router-dom';
// redux
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import "../node_modules/react-vis/dist/style.css";
import { REPORT_INITIAL_LOAD_COMPLETE, SET_SERVER_INFO } from './actions';
import ApiConnection from './ApiConnection';
import AppContainer from './AppContainer';
import { extensionContextDispatch } from './extensionContextDispatch';
import { HitherContext } from './extensions/common/hither';
import WorkspaceSubfeed from './extensions/common/WorkspaceSubfeed';
import initializeHitherInterface, { HitherJobMessage } from './extensions/initializeHitherInterface';
// styling
import theme from './extensions/theme';
import { WorkspaceInfo } from './extensions/WorkspaceView';
import './index.css';
// reducer
import rootReducer from './reducers';
import registerExtensions from './registerExtensions';
// service worker (see unregister() below)
import * as serviceWorker from './serviceWorker';
import './styles.css';

// Create the store and apply middleware
// thunk allows asynchronous actions
const theStore = createStore(rootReducer, {}, applyMiddleware(thunk))
const extensionContext = extensionContextDispatch(theStore.dispatch)
// setDispatch(theStore.dispatch)
registerExtensions(extensionContext)

// This is an open 2-way connection with server (websocket)

const createApiConnection = () => {
  const x = new ApiConnection(theStore)

  x.onMessage(msg => {
    const type0 = msg.type;
    if (type0 === 'reportServerInfo') {
      theStore.dispatch({
        type: SET_SERVER_INFO,
        serverInfo: msg.serverInfo
      });
    }
    else if (type0 === 'subfeedMessage') {
      const watchName = msg.watchName
      const message = msg.message
      if (['recordings', 'sortings'].includes(watchName)) {
        if ('action' in message) {
          let action = message.action;
          if ('persistKey' in action) {
            // just to be safe (historical)
            delete action['persistKey'];
          }
          theStore.dispatch(action);
        }
      }
    }
    else if (type0 === 'reportInitialLoadComplete') {
      theStore.dispatch({
        type: REPORT_INITIAL_LOAD_COMPLETE
      });
    }
    else if (type0 === 'hitherJobFinished') {
      hither.handleHitherJobFinished(msg);
    }
    else if (type0 === 'hitherJobError') {
      hither.handleHitherJobError(msg);
    }
    else if (type0 === 'hitherJobCreated') {
      hither.handleHitherJobCreated(msg);
    }
    else {
      console.warn(`Unregognized message type from server: ${type0}`)
    }
  });

  return x
}



const workspaceSubfeed = new WorkspaceSubfeed()

let apiConnection: ApiConnection
let queuedHitherJobMessages: HitherJobMessage[] = []
const handleReconnect = () => {
  apiConnection = createApiConnection()
  apiConnection.onConnect(() => {
    console.info('Connected to API server')
    queuedHitherJobMessages.forEach(msg => {
      apiConnection.sendMessage(msg)
    })
    queuedHitherJobMessages = []
  })
  apiConnection.onDisconnect(() => {
    console.info('Disconnected from API server')
  })
  workspaceSubfeed.initialize(apiConnection)
}
handleReconnect() // establish initial connection

const baseSha1Url = `http://${window.location.hostname}:15309/sha1`;
const hither = initializeHitherInterface(baseSha1Url)
hither._registerSendMessage((msg) => {
  if (!apiConnection.isDisconnected()) {
    apiConnection.sendMessage(msg)
  }
  else {
    // being disconnected is not the same as not being connected
    // if connection has not yet been established, then the message will be queued in the apiConnection
    // but if disconnected, we will handle queuing here
    queuedHitherJobMessages.push(msg)
    if (msg.type === 'hitherCreateJob') {
      queuedHitherJobMessages.push(msg)
    }
  }
})

const handleSetWorkspaceInfo = (workspaceInfo: WorkspaceInfo) => {
  // // important to send the subfeed watch messages before the reportClientInfo
  // // because otherwise our initial load will not include the recordings/sortings
  // apiConnection.sendMessage({
  //   type: 'addSubfeedWatch',
  //   watchName: 'recordings',
  //   feedUri: workspaceInfo.feedUri,
  //   subfeedName: {workspaceName: workspaceInfo.workspaceName, key: 'recordings'}
  // })
  // apiConnection.sendMessage({
  //   type: 'addSubfeedWatch',
  //   watchName: 'sortings',
  //   feedUri: workspaceInfo.feedUri,
  //   subfeedName: {workspaceName: workspaceInfo.workspaceName, key: 'sortings'}
  // })

  // report client info
  apiConnection.sendMessage({
    type: 'reportClientInfo',
    clientInfo: {
      feedUri: workspaceInfo.feedUri,
      workspaceName: workspaceInfo.workspaceName,
      readOnly: workspaceInfo.readOnly
    }
  })
}

const content = (
  // <React.StrictMode> // there's an annoying error when strict mode is enabled. See for example: https://github.com/styled-components/styled-components/issues/2154 
  <HitherContext.Provider value={hither}>
    <MuiThemeProvider theme={theme}>
      <Provider store={theStore}>
        <Router>
          <AppContainer onSetWorkspaceInfo={handleSetWorkspaceInfo} onReconnect={handleReconnect} workspaceSubfeed={workspaceSubfeed} />
        </Router>
      </Provider>
    </MuiThemeProvider>
  </HitherContext.Provider>
  // </React.StrictMode>
);

// Render the app
ReactDOM.render(
  content,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();