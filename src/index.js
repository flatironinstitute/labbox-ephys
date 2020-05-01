import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './styles.css';
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { deepPurple, indigo } from '@material-ui/core/colors';

import * as serviceWorker from './serviceWorker';
import rootReducer from './reducers';

import Home from './components/Home';
import About from './components/About';
import Config from './components/Config';
import TheAppBar from './components/TheAppBar'

import ImportRecordings from './containers/ImportRecordings'
import RecordingView from './containers/RecordingView'
import ImportSortings from './containers/ImportSortings';
import { runHitherJob } from './actions';

const theme = createMuiTheme({
  palette: {
    primary: deepPurple,
    secondary: indigo,
  }
});

const persistedState = {};
// // Set up the redux store
// const persistedKeys = [
//   {
//     key: 'computeResources',
//     default: []
//   },
//   {
//     key: 'databaseConfig',
//     default: {}
//   },
//   {
//     key: 'recordings',
//     default: []
//   },
//   {
//     key: 'sortings',
//     default: []
//   }
// ];
// const persistedState = {};
// persistedKeys.forEach(pk => {
//   try {
//     persistedState[pk.key] = JSON.parse(localStorage.getItem(pk.key)) || pk.default;
//   }
//   catch (err) {
//     persistedState.computeResources = pk.default;
//   }
// });
// persistedState.computeResources.forEach(cr => {
//   cr.jobStats = undefined;
//   cr.fetchingJobStats = false;
//   cr.active = undefined;
//   cr.fetchingActive = false;
// });
const store = createStore(rootReducer, persistedState, applyMiddleware(thunk))
// let persistStoreScheduled = false;
// let lastPersistStoreTime = 0;
// store.subscribe(() => {
//   if (persistStoreScheduled) return;
//   persistStoreScheduled = true;
//   const elapsed = (new Date()) - lastPersistStoreTime;
//   const timeout = Math.max(100, 5000 - elapsed);
//   setTimeout(() => {
//     persistStoreScheduled = false;
//     doPersistStore();
//   }, timeout)
//   function doPersistStore() {
//     lastPersistStoreTime = new Date();
//     const state0 = store.getState() || {};
//     persistedKeys.forEach(pk => {
//       localStorage.setItem(pk.key, JSON.stringify(state0[pk.key] || pk.default));
//     })
//   }
// });

const TestPage = () => {
  const [pythonOutput, setPythonOutput] = useState('')

  useEffect(() => {
    (async () => {
      if (!pythonOutput) {
        setPythonOutput('loading...');
        let output = await runHitherJob('test_python_call', {}, {}).wait()
        setPythonOutput(output);
      }
    })();
  })

  return <div>{`Test page... output from python ${pythonOutput}`}</div>;
}

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <Router>
          <TheAppBar>
            <Switch>
              <Route path="/about"><About /></Route>
              <Route path="/test"><TestPage /></Route>
              <Route path="/config"><Config /></Route>
              <Route path="/importRecordings"><ImportRecordings /></Route>
              <Route
                path="/importSortingsForRecording/:recordingId*"
                render={({ match }) => (
                  <ImportSortings recordingId={match.params.recordingId} />
                )}
              />
              <Route
                path="/recording/:recordingId*"
                render={({ match }) => (
                  <RecordingView recordingId={match.params.recordingId} />
                )}
              />
              <Route path="/"><Home /></Route>
            </Switch>
          </TheAppBar>
        </Router>
      </Provider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
