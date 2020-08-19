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

import { sleepMsec } from './hither/createHitherJob';

import { INITIAL_LOAD } from './actions';

import { setJobHandlersByRole } from './hither/createHitherJob';
import { watchForNewMessages, appendMessage, feedIdFromUri, getMessages } from './kachery';

const axios = require('axios');

async function waitForDocumentId(store) {
  while (true) {
    const x = store.getState().documentInfo.documentId;
    if (x) return x;
    await sleepMsec(100);
  }
}

async function waitForFeedUri(store) {
  while (true) {
    const feedUri = store.getState().documentInfo.feedUri;
    if (feedUri) return feedUri;
    await sleepMsec(100);
  }
}

const persistStateMiddleware = store => next => action => {
  const writeAction = async (key, theAction) => {
    const documentId = await waitForDocumentId(store);
    const feedUri = await waitForFeedUri(store);

    const subfeedName = { key, documentId };
    const message = {
      timestamp: (new Date()).getTime(),
      action: theAction
    };
    await appendMessage({feedUri, subfeedName, message })
  }

  if ((action.persistKey) && (action.source !== 'fromActionStream')) {
    writeAction(action.persistKey, action);
    return;
  }
  return next(action);
}

// Create the store
const store = createStore(rootReducer, {}, applyMiddleware(persistStateMiddleware, thunk))


const listenToFeeds = async (keys) => {
  const documentId = await waitForDocumentId(store);
  const feedUri = await waitForFeedUri(store);

  const initialLoad = {};

  if (feedUri.startsWith('sha1://')) {
    for (let key of keys) {
      const events = await getMessages({ feedUri, subfeedName: {key, documentId}, position: 0, waitMsec: 100, maxNumMessages: 0});
      for (let e of events) {
        let action = e.action;
        action.source = 'fromActionStream';
        store.dispatch(action);
      }
    }
    for (let key2 of keys) {
      if (!initialLoad[key2]) {
        store.dispatch({
          type: INITIAL_LOAD,
          key: key2
        });
        initialLoad[key2] = true;
      }
    }
    
    return;
  }

  const feedId = (feedUri === 'default') ? 'default' : feedIdFromUri(feedUri);
  if (!feedId) {
    throw Error(`Unable to get feed id from uri: ${feedUri}`);
  }

  const subfeedWatches = {};
  keys.forEach(key => {
    subfeedWatches[key] = {
      feedId,
      subfeedName: {key, documentId},
      position: 0
    };
  })

  let waitMsec = 100; // first call
  while (true) {
    const messages = await watchForNewMessages({subfeedWatches, waitMsec});
    waitMsec = 6000; // subsequent calls
    for (let key of keys) {
      const events = messages[key] || [];
      subfeedWatches[key].position += events.length;
      for (let e of events) {
        let action = e.action;
        action.source = 'fromActionStream';
        store.dispatch(action);
      }
    }
    for (let key2 of keys) {
      if (!initialLoad[key2]) {
        store.dispatch({
          type: INITIAL_LOAD,
          key: key2
        });
        initialLoad[key2] = true;
      }
    }

    await sleepMsec(100);
  }
}
const feedKeys = ['recordings', 'sortings', 'sortingJobs', 'jobHandlers', 'extensionsConfig'];
listenToFeeds(feedKeys);

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
