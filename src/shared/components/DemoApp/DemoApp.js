/* @flow */

import React from 'react';
// import { Match, Miss } from 'react-router';
import { Route, Switch } from 'react-router-dom';
import Helmet from 'react-helmet';
import { CodeSplit } from 'code-split-component';
import 'normalize.css/normalize.css';
import './globals.scss';
import Error404 from './Error404';
import Header from './Header';
import { safeConfigGet } from '../../utils/config';

function DemoApp() {
  return (
    <div style={{ padding: '10px' }}>
      {/*
        All of the following will be injected into our page header.
        @see https://github.com/nfl/react-helmet
      */}
      <Helmet
        htmlAttributes={safeConfigGet(['htmlPage', 'htmlAttributes'])}
        titleTemplate={safeConfigGet(['htmlPage', 'titleTemplate'])}
        defaultTitle={safeConfigGet(['htmlPage', 'defaultTitle'])}
        meta={safeConfigGet(['htmlPage', 'meta'])}
        link={safeConfigGet(['htmlPage', 'links'])}
        script={safeConfigGet(['htmlPage', 'scripts'])}
      />

      <Header />

      <Switch>
        <Route
          exact
          path="/"
          render={routerProps =>
            <CodeSplit chunkName="home" modules={{ Home: require('./Home') }}>
              { ({ Home }) => Home && <Home {...routerProps} /> }
            </CodeSplit>
          }
        />

        <Route
          path="/posts"
          render={routerProps =>
            <CodeSplit chunkName="posts" modules={{ Posts: require('./Posts') }}>
              { ({ Posts }) => Posts && <Posts {...routerProps} /> }
            </CodeSplit>
          }
        />

        <Route
          path="/about"
          render={routerProps =>
            <CodeSplit chunkName="about" modules={{ About: require('./About') }}>
              { ({ About }) => About && <About {...routerProps} /> }
            </CodeSplit>
          }
        />

        <Route component={Error404} />
      </Switch>


    </div>
  );
}

export default DemoApp;
