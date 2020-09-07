// react
import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

// redux
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk';

// router
import { BrowserRouter as Router } from 'react-router-dom';

// styling
import { theme } from './theme';
import './index.css';
import './styles.css';
import './localStyles.css';
import { ThemeProvider } from '@material-ui/core/styles';
import "../node_modules/react-vis/dist/style.css";
import { CssBaseline } from "@material-ui/core";

// service worker (see unregister() below)
import * as serviceWorker from './serviceWorker';

// reducer
import rootReducer from './reducers';

// The main app container, including the app bar
import AppContainer from './AppContainer';

// Custom routes
import Routes from './Routes';

import { sleepMsec, handleHitherJobFinished, handleHitherJobError, setApiConnection, handleHitherJobCreated, handleHitherJobCreationError } from './hither/createHitherJob';

import { REPORT_INITIAL_LOAD_COMPLETE, SET_SERVER_INFO, SET_WEBSOCKET_STATUS, setDarkMode } from './actions';

import { watchForNewMessages, getMessages } from './kachery';


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
const persistStateMiddleware = store => next => action => {
  // this middleware is applied to the redux store
  // it inserts itself as part
  // of the action-processesing pipeline
  const sendAction = async (key, theAction) => {
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
const store = createStore(rootReducer, {}, applyMiddleware(persistStateMiddleware, thunk))

// This is an open 2-way connection with server (websocket)
class ApiConnection {
  constructor() {
    const url = process.env.REACT_APP_API_URL ?
      `wss://${process.env.REACT_APP_API_URL.slice(8)}/websocket` :
      `ws://${window.location.hostname}:15308`;

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
      store.dispatch({ type: SET_WEBSOCKET_STATUS, websocketStatus: 'connected' });
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
      store.dispatch({ type: SET_WEBSOCKET_STATUS, websocketStatus: 'disconnected' });
    })

    this._ws.addEventListener('error', args => {
      console.log('Error')
      console.log(args)
    })

    this._onMessageCallbacks = [];
    this._onConnectCallbacks = [];
    this._connected = false;
    this._isDisconnected = false;
    this._queuedMessages = [];
    this._start();
  }
  onMessage(cb) {
    this._onMessageCallbacks.push(cb);
  }
  onConnect(cb) {
    this._onConnectCallbacks.push(cb);
    if (this._connected) {
      cb();
    }
  }
  isDisconnected() {
    return this._isDisconnected;
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
      this.sendMessage({ type: 'keepAlive' });
    }
  }
}
const apiConnection = new ApiConnection();
apiConnection.onConnect(() => {
  console.info('Connected to API server');
})
apiConnection.onMessage(msg => {
  console.log(msg)
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

const Content = ({ darkMode }) => {
  const themeMemo = useMemo(() => theme(darkMode ? "dark" : "light"), [
    darkMode
  ]);

  return (
    // <React.StrictMode> // there's an annoying error when strict mode is enabled. See for example: https://github.com/styled-components/styled-components/issues/2154 
    <ThemeProvider theme={themeMemo}>
      <CssBaseline />
      <Router>
        <AppContainer>
          <Routes />
        </AppContainer>
      </Router>
    </ThemeProvider>
    // </React.StrictMode>
  );
}


const mapStateToProps = state => ({
  darkMode: state.darkMode
})

const ContentConnected = connect(mapStateToProps)(Content)

const App = () => {
  return <Provider store={store}>
    <ContentConnected />
  </Provider>
}

// Render the app
ReactDOM.render(
  <App />,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();