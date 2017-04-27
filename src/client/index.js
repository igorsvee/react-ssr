/* @flow */
/* eslint-disable global-require */

import React from 'react';
import {render} from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {Provider as ReduxProvider} from 'react-redux';
import {rehydrateJobs} from 'react-jobs/ssr';
import configureStore from '../shared/redux/configureStore';
import ReactHotLoader from './components/ReactHotLoader';
import DemoApp from '../shared/components/DemoApp';
import Immutable from 'seamless-immutable'
import asyncBootstrapper from 'react-async-bootstrapper';
import { AsyncComponentProvider, createAsyncContext } from 'react-async-component';
import { JobProvider } from 'react-jobs';

// Get the DOM Element that will host our React application.
const container = document.querySelector('#app');
//  not using this function because it's slower than Immutable()
function toImmutable(initialState) {
  // Transform into seamless collections,
  // but leave top level keys untouched for Redux
  const state = {...initialState};

  Object
    .keys(state)
    .forEach(key => {
      state[key] = Immutable(state[key]);
    });

  return state;
}

// Does the user's browser support the HTML5 history API?
// If the user's browser doesn't support the HTML5 history API then we
// will force full page refreshes on each page change.
const supportsHistory = 'pushState' in window.history;

// Get any rehydrateState for the async components.
// eslint-disable-next-line no-underscore-dangle
const asyncComponentsRehydrateState = window.__ASYNC_COMPONENTS_REHYDRATE_STATE__;

// Get any rehydrateState for the jobs.
// eslint-disable-next-line no-underscore-dangle
  const jobsRehydrateState = window.__JOBS_REHYDRATE_STATE__;

// Create our Redux store.
const store = configureStore(
  // Server side rendering would have mounted our state on this global.
  // window.__APP_STATE__, // eslint-disable-line no-underscore-dangle
  Immutable(window.__APP_STATE__)
  // toImmutable(window.__APP_STATE__)
);

function renderApp(TheApp) {

    const app = (
      <ReactHotLoader>
        <AsyncComponentProvider rehydrateState={asyncComponentsRehydrateState}>
          <JobProvider rehydrateState={jobsRehydrateState}>
          <ReduxProvider store={store}>
            <BrowserRouter forceRefresh={!supportsHistory}>
              <TheApp />
            </BrowserRouter>
          </ReduxProvider>
          </JobProvider>
        </AsyncComponentProvider>
      </ReactHotLoader>
    );

  //  splitting
  asyncBootstrapper(app)
  //  react jobs
  //   .then((res) =>rehydrateJobs(app))
    .then(() =>
      render(app, container),
    );
}

// The following is needed so that we can support hot reloading our application.
if (process.env.NODE_ENV === 'development' && module.hot) {
  // Accept changes to this file for hot reloading.
  module.hot.accept('./index.js');
  // Any changes to our App will cause a hotload re-render.
  module.hot.accept(
    '../shared/components/DemoApp',
    () => renderApp(require('../shared/components/DemoApp').default),
  );
}

// Execute the first render of our app.
renderApp(DemoApp);

// This registers our service worker for asset caching and offline support.
// Keep this as the last item, just in case the code execution failed (thanks
// to react-boilerplate for that tip.)
require('./registerServiceWorker');
