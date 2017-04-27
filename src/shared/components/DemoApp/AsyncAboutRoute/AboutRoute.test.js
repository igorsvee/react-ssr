/* @flow */
/* eslint-disable import/no-extraneous-dependencies */

import React from 'react';
import {shallow, mount} from "enzyme"
import About, {contributors} from './AboutRoute';
import Contributor from './Contributor/Contributor';
import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
const expect = chai.expect;
describe('<About />', () => {
  context('using shallow Rendering API ', function () {
    it('renders', () => {
      const wrapper = shallow(<About />);
      expect(wrapper.find(Contributor)).to.have.length(contributors.length);
    });
  })


});
