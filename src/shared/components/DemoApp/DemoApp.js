/* @flow */

import React from 'react';
// import { Match, Miss } from 'react-router';
import {Route, Switch} from 'react-router-dom';
import Helmet from 'react-helmet';


import 'normalize.css/normalize.css';
import './globals.scss';
import css from "./DemoApp.pcss";
import Error404 from './Error404';
import Header from './Header';
import {safeConfigGet} from '../../utils/config';
import AsyncHomeRoute from './AsyncHomeRoute';
import AsyncAboutRoute from './AsyncAboutRoute';
import AsyncPostsRoute from './AsyncPostsRoute';
function DemoApp() {
  return (
    <div>
      <div styleName="css.cont">

      </div>
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
        <Route exact path="/" component={AsyncHomeRoute}/>
        <Route path="/about" component={AsyncAboutRoute}/>
        <Route path="/posts" component={AsyncPostsRoute}/>

        <Route component={Error404}/>
      </Switch>


    </div >
  );
}

export default DemoApp;
