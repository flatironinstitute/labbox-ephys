// react
import React from 'react';
import ReactDOM from 'react-dom';

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
import { ThemeProvider } from '@material-ui/core/styles';

// service worker (see unregister() below)
import * as serviceWorker from './serviceWorker';

// reducer
import rootReducer from './reducers';

// The main app container, including the app bar
import AppContainer from './AppContainer';

// Custom routes
import Routes from './Routes';

import EventStreamClient from './eventstreamclient/EventStreamClient'
import { sleepMsec } from './hither/createHitherJob';

import { INITIAL_LOAD } from './actions';

import { setJobHandlersByRole } from './hither/createHitherJob';

const axios = require('axios');

let eventStreamClient = null;
let eventStreamClientStatus = null;
async function initializeEventStreamClient() {
  if (eventStreamClientStatus === 'initializing') {
    while (eventStreamClientStatus !== 'initialized') {
      await sleepMsec(100);
    }
    return;
  }
  eventStreamClientStatus = 'initializing';
  const x = (await axios.get('/api/get_event_stream_websocket_port')).data;
  const port = x.port;
  const url = `ws://localhost:${port}` // TODO: generalize this
  const webSocketUrl = url;
  const eventStreamClientOpts = {
    useWebSocket: true,
    webSocketUrl: webSocketUrl
  }
  eventStreamClient = new EventStreamClient('/api/eventstream', 'readwrite', 'readwrite', eventStreamClientOpts);
  eventStreamClientStatus = 'initialized';
}
const persistStateMiddleware = store => next => action => {
  const writeAction = async (key, theAction) => {
    if (eventStreamClientStatus !== 'initialized') {
      await initializeEventStreamClient();
    }
    const stream = eventStreamClient.getStream({ key: key });
    await stream.writeEvent({
      timestamp: (new Date()).getTime(),
      action: theAction
    });
  }

  if ((action.persistKey) && (action.source !== 'fromActionStream')) {
    writeAction(action.persistKey, action);
    return;
  }
  return next(action);
}

// Create the store
const store = createStore(rootReducer, {}, applyMiddleware(persistStateMiddleware, thunk))

const listenToActionStream = async (key) => {
  if (eventStreamClientStatus !== 'initialized') {
    await initializeEventStreamClient();
  }
  const stream = eventStreamClient.getStream({ key: key });
  const initialLoad = false;
  const numEvents = await stream.getNumEvents();
  if (!numEvents) {
    store.dispatch({
      type: INITIAL_LOAD,
      key: key
    });
  }
  while (true) {
    await sleepMsec(100);
    const events = await stream.readEvents(12000);
    for (let e of events) {
      let action = e.action;
      action.source = 'fromActionStream';
      store.dispatch(action);
    }
    if (events.length > 0) {
      if (!initialLoad) {
        store.dispatch({
          type: INITIAL_LOAD,
          key: key
        });
      }
    }
  }
}
['recordings', 'sortings', 'sortingJobs', 'jobHandlers', 'extensionsConfig'].forEach(
  key => listenToActionStream(key)
)

store.subscribe(() => {
  const state = store.getState().jobHandlers;
  const jobHandlersByRole = {};
  for (let role in state.roleAssignments) {
    const handlerId = state.roleAssignments[role];
    const handlerConfig = state.jobHandlers.filter(jh => (jh.jobHandlerId === handlerId))[0];
    if (handlerConfig) {
      jobHandlersByRole[role] = handlerConfig;
    }
  }
  setJobHandlersByRole(jobHandlersByRole);
})

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
