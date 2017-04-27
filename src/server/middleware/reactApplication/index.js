/* @flow */

import type { $Request, $Response, Middleware } from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
// import { ServerRouter, createServerRenderContext } from 'react-router';
import { StaticRouter, createServerRenderContext } from 'react-router';
import { Provider } from 'react-redux';

import Helmet from 'react-helmet';
import { runJobs } from 'react-jobs/ssr';
import generateHTML from './generateHTML';
import DemoApp from '../../../shared/components/DemoApp';
import configureStore from '../../../shared/redux/configureStore';
import config from '../../../../config';
import { AsyncComponentProvider, createAsyncContext } from 'react-async-component';
import asyncBootstrapper from 'react-async-bootstrapper';
import { JobProvider, createJobContext } from 'react-jobs';
/**
 * An express middleware that is capabable of service our React application,
 * supporting server side rendering of the application.
 */
function reactApplicationMiddleware(request: $Request, response: $Response) {
  // We should have had a nonce provided to us.  See the server/index.js for
  // more information on what this is.
  if (typeof response.locals.nonce !== 'string') {
    throw new Error('A "nonce" value has not been attached to the response');
  }
  const nonce = response.locals.nonce;

  // It's possible to disable SSR, which can be useful in development mode.
  // In this case traditional client side only rendering will occur.
  if (config.disableSSR) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('==> Handling react route without SSR');
    }
    // SSR is disabled so we will just return an empty html page and will
    // rely on the client to initialize and render the react application.
    const html = generateHTML({
      // Nonce which allows us to safely declare inline scripts.
      nonce,
    });
    response.status(200).send(html);
    return;
  }

  // Create the redux store.
  const store = configureStore();
  const { getState } = store;

  // Create a context for our AsyncComponentProvider.
  const asyncComponentsContext = createAsyncContext();

  // Create a context for our JobProvider.
   const jobContext = createJobContext();

  // First create a context for <StaticRouter>, which will allow us to
  // query for the results of the render.
  const reactRouterContext = {};


  // Define our app to be server rendered.
  const app = (
    <AsyncComponentProvider asyncContext={asyncComponentsContext}>
      <JobProvider jobContext={jobContext}>
      <StaticRouter location={request.url} context={reactRouterContext}>
        <Provider store={store}>
          <DemoApp />
        </Provider>
      </StaticRouter>
      </JobProvider>
    </AsyncComponentProvider>
  );

  asyncBootstrapper(app)
  // Firstly we will use the "runJobs" helper to execute all the jobs
  // that have been attached to the components being rendered in our app.
  .then(() => {
    // Create our application and render it into a string.
    const reactAppString = renderToString(app);

    // Generate the html response.
    const html = generateHTML({
      // Provide the rendered React applicaiton string.
      reactAppString,
      // Nonce which allows us to safely declare inline scripts.
      nonce,
      // Running this gets all the helmet properties (e.g. headers/scripts/title etc)
      // that need to be included within our html.  It's based on the rendered app.
      // @see https://github.com/nfl/react-helmet
      helmet: Helmet.rewind(),
      // We provide our code split state so that it can be included within the
      // html, and then the client bundle can use this data to know which chunks/
      // modules need to be rehydrated prior to the application being rendered.
      asyncComponentsState : asyncComponentsContext.getState(),
      //  react-jobs state
      jobsState : jobContext.getState(),
      // codeSplitState: codeSplitContext.getState(),
      // Provide the redux store state, this will be bound to the window.__APP_STATE__
      // so that we can rehydrate the state on the client.
      initialState: getState(),
      // Pass through the react-jobs provided state so that it can be serialized
      // into the HTML and then the browser can use the data to rehydrate the
      // application appropriately.
    });

    // Get the render result from the server render context.
    // const renderResult = reactRouterContext.getResult();

    // Check if the render result contains a redirect, if so we need to set
    // the specific status and redirect header and end the response.
    if (reactRouterContext.url) {
      response.writeHead(302, { Location: reactRouterContext.url });
      response.end();
      return;
    }

    response.status(200).send(html);

  });
}

export default (reactApplicationMiddleware : Middleware);
