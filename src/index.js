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

// Create the store
const store = createStore(rootReducer, {}, applyMiddleware(thunk))

// Render the app
ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <Router>
          <AppContainer>
            <Routes />
          </AppContainer>
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
