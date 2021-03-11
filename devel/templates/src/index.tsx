import { createExtensionContext, LabboxProvider } from 'labbox';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import config from './config.json';
import './index.css';
import { {{ classPrefix }}Plugin } from './python/{{ projectNameUnderscore }}/extensions/pluginInterface';
import registerExtensions from './registerExtensions';
import reportWebVitals from './reportWebVitals';

const apiConfig = {
  webSocketUrl: `ws://${window.location.hostname}:${config.webSocketPort}`,
  baseSha1Url: `http://${window.location.hostname}:${config.httpPort}/sha1`,
  baseFeedUrl: `http://${window.location.hostname}:${config.httpPort}/feed`
}

const extensionContext = createExtensionContext<{{ classPrefix }}Plugin>()
registerExtensions(extensionContext).then(() => {
  ReactDOM.render(
    // <React.StrictMode>
      <LabboxProvider
        extensionContext={extensionContext}
        apiConfig={apiConfig}
      >
        <BrowserRouter><App version="{{ projectVersion }}" /></BrowserRouter>
      </LabboxProvider>,
    // </React.StrictMode>,
    document.getElementById('root')
  );  
})

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();


