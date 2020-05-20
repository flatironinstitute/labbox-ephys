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
import { ADD_RECORDING, sleep, DELETE_RECORDINGS, SET_RECORDING_INFO } from './actions';

import { EventStreamClient } from './loggery'
import { sleepMsec } from './hither/createHitherJob';

const persistStateMiddleware = store => next => action => {
  const esc = new EventStreamClient('/api/loggery', 'readwrite', 'readwrite');
  const writeAction = async (key, theAction) => {
    const stream = esc.getStream({ key: key });
    await stream.writeEvent(theAction);
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
  const esc = new EventStreamClient('/api/loggery', 'readwrite', 'readwrite');
  const stream = esc.getStream({ key: key });
  while (true) {
    await sleepMsec(500);
    const events = await stream.readEvents(3000);
    for (let e of events) {
      e.source = 'fromActionStream';
      store.dispatch(e);
    }
  }
}
['recordings', 'sortings', 'sortingJobs', 'jobHandlers'].forEach(
  key => listenToActionStream(key)
)

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
