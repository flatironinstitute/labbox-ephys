// react
import React from 'react';
import ReactDOM from 'react-dom';

// socket.io-client
import io from 'socket.io-client';

// redux
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk';

// router
import { BrowserRouter as Router } from 'react-router-dom';

// styling
import theme from './theme';
import './index.css';
import './styles.css';
import './localStyles.css';
import { ThemeProvider } from '@material-ui/core/styles';
import "../node_modules/react-vis/dist/style.css";

// service worker (see unregister() below)
import * as serviceWorker from './serviceWorker';

// reducer
import rootReducer from './reducers';

// The main app container, including the app bar
import AppContainer from './AppContainer';

// Custom routes
import Routes from './Routes';

import { sleepMsec, handleHitherJobFinished, handleHitherJobError, setApiConnection, handleHitherJobCreated, handleHitherJobCreationError } from './hither/createHitherJob';

import { REPORT_INITIAL_LOAD_COMPLETE, SET_SERVER_INFO, SET_WEBSOCKET_STATUS } from './actions';

import { watchForNewMessages, getMessages } from './kachery';


const persistStateMiddleware = store => next => action => {
  const writeAction = async (key, theAction) => {
    delete theAction['persistKey'];
    apiConnection.sendMessage({
      type: 'appendDocumentAction',
      key,
      action: theAction
    });
  }

  if (action.persistKey) {
    writeAction(action.persistKey, action);
    return;
  }
  return next(action);
}

// Create the store
const store = createStore(rootReducer, {}, applyMiddleware(persistStateMiddleware, thunk))

// connect to the server api
class ApiConnection {
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
      store.dispatch({type: SET_WEBSOCKET_STATUS, websocketStatus: 'connected'});
    });
    this._ws.addEventListener('message', evt => {
      const x = JSON.parse(evt.data);
      console.info('INCOMING MESSAGE', x);
      this._onMessageCallbacks.forEach(cb => cb(x));
    });
    this._ws.addEventListener('close', () => {
      console.warn('Websocket disconnected.');
      this._connected = false;
      this._disconnected = true;
      store.dispatch({type: SET_WEBSOCKET_STATUS, websocketStatus: 'disconnected'});
    })

    this._onMessageCallbacks = [];
    this._onConnectCallbacks = [];
    this._connected = false;
    this._disconnected = false;
    this._queuedMessages = [];
    this._start();
  }
  onMessage(cb) {
    this._onMessageCallbacks.push(cb);
  }
  onConnect(cb) {
    this._onConnectCallbacks.push(cb);
  }
  disconnected() {
    return this._disconnected;
  }
  sendMessage(msg) {
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
      this.sendMessage({type: 'keepAlive'});
    }
  }
}
const apiConnection = new ApiConnection();
apiConnection.onConnect(() => {
  console.info('Connected to API server');
})
apiConnection.onMessage(msg => {
  const type0 = msg.type;
  if (type0 === 'reportServerInfo') {
    const { nodeId, defaultFeedId } = msg.serverInfo;
    store.dispatch({
      type: SET_SERVER_INFO,
      nodeId,
      defaultFeedId
    });
  }
  else if (type0 === 'action') {
    let action = msg.action;
    if ('persistKey' in action) {
      // just to be safe
      delete action['persistKey'];
    }
    store.dispatch(action);
  }
  else if (type0 === 'reportInitialLoadComplete') {
    store.dispatch({
      type: REPORT_INITIAL_LOAD_COMPLETE
    });
  }
  else if (type0 === 'hitherJobFinished') {
    handleHitherJobFinished(msg);
  }
  else if (type0 === 'hitherJobError') {
    handleHitherJobError(msg);
  }
  else if (type0 === 'hitherJobCreated') {
    handleHitherJobCreated(msg);
  }
  else if (type0 === 'hitherJobCreationError') {
    handleHitherJobCreationError(msg);
  }
  else {
    console.warn(`Unregognized message type from server: ${type0}`)
  }
});
setApiConnection(apiConnection);
const waitForDocumentInfo = async () => {
  while (true) {
    const documentInfo = store.getState().documentInfo;
    if (documentInfo.documentId) {
      apiConnection.sendMessage({
        type: 'reportClientInfo',
        clientInfo: {
          feedUri: documentInfo.feedUri,
          documentId: documentInfo.documentId,
          readonly: documentInfo.readonly
        }
      })
      return;
    }
    await sleepMsec(10);
  }
}
waitForDocumentInfo();

const content = (
  // <React.StrictMode> // there's an annoying error when strict mode is enabled. See for example: https://github.com/styled-components/styled-components/issues/2154 
  <ThemeProvider theme={theme}>
    <Provider store={store}>
      <Router>
        <AppContainer>
          <Routes />
        </AppContainer>
      </Router>
    </Provider>
  </ThemeProvider>
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