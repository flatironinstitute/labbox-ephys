import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './styles.css';
import Home from './components/Home';
import About from './components/About';
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { deepPurple, indigo } from '@material-ui/core/colors';

import * as serviceWorker from './serviceWorker';
import rootReducer from './reducers';

import Config from './components/Config';
import TheAppBar from './components/TheAppBar'
import ImportRecordings from './containers/ImportRecordings'

const theme = createMuiTheme({
  palette: {
    primary: deepPurple,
    secondary: indigo,
  }
});

// Set up the redux store
const persistedState = {};
try {
  persistedState.computeResources = JSON.parse(localStorage.getItem('computeResources')) || []
}
catch (err) {
  persistedState.computeResources = [];
}
try {
  persistedState.databaseConfig = JSON.parse(localStorage.getItem('databaseConfig')) || {}
}
catch (err) {
  persistedState.databaseConfig = {};
}
persistedState.computeResources.forEach(cr => {
  cr.jobStats = undefined;
  cr.fetchingJobStats = false;
  cr.active = undefined;
  cr.fetchingActive = false;
});
const store = createStore(rootReducer, persistedState, applyMiddleware(thunk))
store.subscribe(() => {
  const state0 = store.getState() || {};
  const computeResources = state0.computeResources || [];
  localStorage.setItem('computeResources', JSON.stringify(computeResources))
  localStorage.setItem('databaseConfig', JSON.stringify(state0.databaseConfig || {}))
})

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <Router>
          <TheAppBar>
            <Switch>
              <Route path="/about"><About /></Route>
              <Route path="/config"><Config /></Route>
              <Route path="/importRecordings"><ImportRecordings /></Route>
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
