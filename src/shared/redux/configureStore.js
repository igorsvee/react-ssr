/* @flow */

import {createStore, applyMiddleware, compose} from 'redux';
// import thunk from 'redux-thunk';
import thunk from 'redux-thunk-fsa';
import axios from 'axios';
import reducer from '../reducers';
import type {State} from '../reducers';
import {createLogger} from 'redux-logger'
function configureStore(initialState: ?State) {
  const middleware = [];
  const enhancers = [];

  /* ------------- Redux thunk Middleware ------------- */
  middleware.push(thunk.withExtraArgument({extraArgument: {axios}}));

  if (process.env.NODE_ENV === 'development') {
    middleware.push(createLogger())
  }
  // Redux Dev Tools store enhancer.
  // @see https://github.com/zalmoxisus/redux-devtools-extension
  // We only want this enhancer enabled for development and when in a browser
  // with the extension installed.
  if (process.env.NODE_ENV === 'development'
    && typeof window !== 'undefined'
    && typeof window.devToolsExtension !== 'undefined') {
     middleware.push(window.devToolsExtension())
  }

  enhancers.push(applyMiddleware(...middleware));

  const store = initialState
    ? createStore(reducer, initialState, compose(...enhancers))
    : createStore(reducer, compose(...enhancers));

  if (process.env.NODE_ENV === 'development' && module.hot) {
    // Enable Webpack hot module replacement for reducers. This is so that we
    // don't lose all of our current application state during hot reloading.
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers').default; // eslint-disable-line global-require

      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}

// NOTE: If we create an '/api' endpoint in our application then we will neeed to
// configure the axios instances so that they will resolve to the proper URL
// endpoints on the server. We have to provide absolute URLs for any of our
// server bundles. To do so we can set the default 'baseURL' for axios. Any
// relative path requests will then be appended to the 'baseURL' in order to
// form an absolute URL.
// We don't need to worry about this for client side executions, relative paths
// will work fine there.
// Example:
//
// const axiosConfig = process.env.IS_NODE === true
//   ? { baseURL: process.env.NOW_URL || notEmpty(process.env.SERVER_URL) }
//   : {};
//
// Then we will then have to initialise our redux-thunk middlware like so:
//
// thunk.withExtraArgument({
//   axios: axios.create(axiosConfig),
// })

export default configureStore;
