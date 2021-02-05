// react
import { MuiThemeProvider } from '@material-ui/core';
import React, { Dispatch } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
// router
import { BrowserRouter as Router } from 'react-router-dom';
// redux
import { AnyAction, applyMiddleware, createStore, Middleware, MiddlewareAPI } from 'redux';
import thunk from 'redux-thunk';
import "../node_modules/react-vis/dist/style.css";
import { REPORT_INITIAL_LOAD_COMPLETE, SET_SERVER_INFO, SET_WEBSOCKET_STATUS } from './actions';
import AppContainer, { WorkspaceInfo } from './AppContainer';
import { extensionContextDispatch } from './extensionContextDispatch';
import { HitherContext } from './extensions/common/hither';
import { sleepMsec } from './extensions/common/misc';
import initializeHitherInterface, { HitherJobMessage } from './extensions/initializeHitherInterface';
// styling
import theme from './extensions/theme';
import './index.css';
// reducer
import rootReducer from './reducers';
import registerExtensions from './registerExtensions';
// service worker (see unregister() below)
import * as serviceWorker from './serviceWorker';
import './styles.css';

/*
What does this middleware do?

It allows us to dispatch actions to manipulate the redux state
in the usual way, but if the action has a persistKey field,
then this middleware redirects the action to the server for
persistence. Once the server has applied the action to the live
feed, the new messages on the feed will propagate back to the
client side (there is a feed listener) and at that time the action
will actually be played out on the redux state (because the
persistKey will have been stripped).
*/
const persistStateMiddleware: Middleware = (api: MiddlewareAPI) => (next: Dispatch<AnyAction>) => (action: any) => {
  // this middleware is applied to the redux store
  // it inserts itself as part
  // of the action-processesing pipeline
  const sendAction = async (key: string, theAction: any) => {
    delete theAction['persistKey'];
    apiConnection.sendMessage({
      type: 'appendDocumentAction',
      key,
      action: theAction
    });
  }

  if (action.persistKey) {
    // if the action has persistKey field, then
    // send it to the server
    sendAction(action.persistKey, action);
    return;
  }
  return next(action);
}

// Create the store and apply middleware
// persistStateMiddleware is described above
// thunk allows asynchronous actions
const theStore = createStore(rootReducer, {}, applyMiddleware(persistStateMiddleware, thunk))
const extensionContext = extensionContextDispatch(theStore.dispatch)
// setDispatch(theStore.dispatch)
registerExtensions(extensionContext)

// This is an open 2-way connection with server (websocket)
class ApiConnection {
  _ws: WebSocket
  _connected: boolean = false
  _onMessageCallbacks: ((m: any) => void)[] = []
  _onConnectCallbacks: (() => void)[] = []
  _onDisconnectCallbacks: (() => void)[] = []
  _isDisconnected = false // once disconnected, cannot reconnect - need to create a new instance
  _queuedMessages: any[] = []

  constructor() {
    const url = `ws://${window.location.hostname}:15308`;

    this._ws = new WebSocket(url);
    console.log(this._ws);
    this._ws.addEventListener('open', () => {
      this._connected = true;
      const qm = this._queuedMessages;
      this._queuedMessages = [];
      for (let m of qm) {
        this.sendMessage(m);
      }
      this._onConnectCallbacks.forEach(cb => cb());
      theStore.dispatch({type: SET_WEBSOCKET_STATUS, websocketStatus: 'connected'});
    });
    this._ws.addEventListener('message', evt => {
      const x = JSON.parse(evt.data);
      console.info('INCOMING MESSAGE', x);
      this._onMessageCallbacks.forEach(cb => cb(x));
    });
    this._ws.addEventListener('close', () => {
      console.warn('Websocket disconnected.');
      this._connected = false;
      this._isDisconnected = true;
      this._onDisconnectCallbacks.forEach(cb => cb())
      theStore.dispatch({type: SET_WEBSOCKET_STATUS, websocketStatus: 'disconnected'});
    })
    
    this._start();
  }
  onMessage(cb: (m: any) => void) {
    this._onMessageCallbacks.push(cb);
  }
  onConnect(cb: () => void) {
    this._onConnectCallbacks.push(cb);
    if (this._connected) {
      cb();
    }
  }
  onDisconnect(cb: () => void) {
    this._onDisconnectCallbacks.push(cb)
    if (this._isDisconnected) {
      cb()
    }
  }
  isDisconnected() {
    return this._isDisconnected;
  }
  sendMessage(msg: any) {
    if (!this._connected) {
      this._queuedMessages.push(msg);
      return;
    }
    console.info('OUTGOING MESSAGE', msg);
    this._ws.send(JSON.stringify(msg));
  }
  async _start() {
    while (true) {
      await sleepMsec(17000);
      if (!this._isDisconnected) this.sendMessage({type: 'keepAlive'});
    }
  }
}

const createApiConnection = () => {
  const x = new ApiConnection()

  x.onMessage(msg => {
    const type0 = msg.type;
    if (type0 === 'reportServerInfo') {
      theStore.dispatch({
        type: SET_SERVER_INFO,
        serverInfo: msg.serverInfo
      });
    }
    else if (type0 === 'action') {
      let action = msg.action;
      if ('persistKey' in action) {
        // just to be safe
        delete action['persistKey'];
      }
      theStore.dispatch(action);
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
          <AppContainer onSetWorkspaceInfo={handleSetWorkspaceInfo} onReconnect={handleReconnect} />
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