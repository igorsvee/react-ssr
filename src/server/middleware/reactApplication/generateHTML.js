/* @flow */

// This module is responsible for generating the HTML page response for
// the react application middleware.
//
// NOTE: If you are using a service worker to support offline mode for your
// application then please make sure that you keep the structure of the html
// within this module in sync with the module used to generate the offline
// HTML page.
// @see ./tools/webpack/offlinePage/generate.js

import type { Head } from 'react-helmet';
import serialize from 'serialize-javascript';
import getAssetsForClientChunks from './getAssetsForClientChunks';
import config, { clientConfig } from '../../../../config';
import { safeConfigGet } from '../../../shared/utils/config';
function styleTags(styles : Array<string>) {
  return styles
    .map(style =>
      `<link href="${style}" media="screen, projection" rel="stylesheet" type="text/css" />`,
    )
    .join('\n');
}

function scriptTag(jsFilePath: string) {
  return `<script type="text/javascript" src="${jsFilePath}"></script>`;
}

function scriptTags(jsFilePaths : Array<string>) {
  return jsFilePaths.map(scriptTag).join('\n');
}

type Args = {
  reactAppString?: string,
  initialState?: Object,
  nonce: string,
  helmet?: Head,
  asyncComponentsState : Object,
  jobsState: Object,
};

export default function generateHTML(args: Args) {
  const { reactAppString, initialState, nonce, helmet, asyncComponentsState, jobsState } = args;
  // The chunks that we need to fetch the assets (js/css) for and then include
  // said assets as script/style tags within our html.
  const chunksForRender = [
    // We always manually add the main entry chunk for our client bundle. It
    // must always be the first item in the collection.
    'index',
  ];


  // Now we get the assets (js/css) for the chunks.
  const assetsForRender = getAssetsForClientChunks(chunksForRender);

  // Creates an inline script definition that is protected by the nonce.
  const inlineScript = body =>
    `<script nonce="${nonce}" type='text/javascript'>
       ${body}
     </script>`;

  const serviceWorkerInclusionCode = `
    function printState(state) {
    document.getElementById('state').innerHTML = state;
    }
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(
        'sw.js',
        {scope: './'}
    ).then(function (registration) {
      var serviceWorker;
      document.getElementById('status').innerHTML = 'successful';
      if (registration.installing) {
        serviceWorker = registration.installing;
        printState('installing');
      } else if (registration.waiting) {
        serviceWorker = registration.waiting;
        printState('waiting');
      } else if (registration.active) {
        serviceWorker = registration.active;
        printState('active');
      }
      if (serviceWorker) {
        printState(serviceWorker.state);
        serviceWorker.addEventListener('statechange',
            function (e) {
              printState(e.target.state);
            });
      }

    }).catch(function (error) {
      document.getElementById('status').innerHTML = error;
    });
  } else {
    document.getElementById('status').innerHTML =
        'unavailable';
  }`;
  return `<!DOCTYPE html>
    <html ${helmet ? helmet.htmlAttributes.toString() : ''}>
      <head>
        ${helmet ? helmet.title.toString() : ''}
        ${helmet ? helmet.meta.toString() : ''}
        ${helmet ? helmet.link.toString() : ''}
        ${styleTags(assetsForRender.css)}
        ${helmet ? helmet.style.toString() : ''}
      </head>
      <body>
       <div id='status'></div>
        <div id='state'></div>
        <div id='app'>${reactAppString || ''}</div>
        ${
          // Binds the client configuration object to the window object so
          // that we can safely expose some configuration values to the
          // client bundle that gets executed in the browser.
          inlineScript(`window.__CLIENT_CONFIG__=${serialize(clientConfig)}`)
        }
        ${
          // Bind the initial application state based on the server render
          // so the client can register the correct initial state for the view.
          initialState
            ? inlineScript(`window.__APP_STATE__=${serialize(initialState)};`)
            : ''
        }
        ${
    // Bind our async components state so the client knows which ones
    // to initialise so that the checksum matches the server response.
    // @see https://github.com/ctrlplusb/react-async-component
           asyncComponentsState
            ? inlineScript(`window.__ASYNC_COMPONENTS_REHYDRATE_STATE__=${serialize(asyncComponentsState)};`)
            : ''
        }
        ${
          jobsState
            ? inlineScript(`window.__JOBS_REHYDRATE_STATE__=${serialize(jobsState)};`)
            : ''
        }
        ${
         safeConfigGet(['serviceWorker', 'enabledInline'])
         ? inlineScript(serviceWorkerInclusionCode)
          : ''
         }
        ${
          // Enable the polyfill io script?
          // This can't be configured within a react-helmet component as we
          // may need the polyfill's before our client bundle gets parsed.
          config.polyfillIO.enabled
            ? scriptTag(config.polyfillIO.url)
            : ''
        }
        ${
          // When we are in development mode our development server will generate a
          // vendor DLL in order to dramatically reduce our compilation times.  Therefore
          // we need to inject the path to the vendor dll bundle below.
          // @see /tools/development/ensureVendorDLLExists.js
          process.env.NODE_ENV === 'development'
            && config.bundles.client.devVendorDLL.enabled
            ? scriptTag(`${config.bundles.client.webPath}${config.bundles.client.devVendorDLL.name}.js?t=${Date.now()}`)
            : ''
        }
        ${scriptTags(assetsForRender.js)}
        ${helmet ? helmet.script.toString() : ''}
      </body>
    </html>`;
}
