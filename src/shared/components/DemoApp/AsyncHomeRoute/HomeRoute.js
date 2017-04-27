import React from 'react';
import Helmet from 'react-helmet';



import { safeConfigGet } from '../../../utils/config';

function HomeRoute() {
  return (
    <div>
      <Helmet>
        <title>Home</title>
      </Helmet>

      <h2>{safeConfigGet(['welcomeMessage'])}</h2>

      <p>
        This starter kit contains all the build tooling and configuration you
        need to kick off your next universal React project, whilst containing a
        minimal project set up allowing you to make your own architecture
        decisions (Redux/Mobx etc).
      </p>
    </div>
  );
}

export default HomeRoute;
