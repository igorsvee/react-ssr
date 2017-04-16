/* eslint-disable import/no-extraneous-dependencies */
// PostCSS-Loader config options
var BEM_CONFIG = {
  defaultNamespace: undefined, // default namespace to use, none by default
  style: 'bem',
  separators: {
    modifier: '--'
  },
  shortcuts: {
    'component': 'b',
    'descendent': 'e',
    'modifier': 'm'
  }
};
module.exports = {
  plugins: [require('postcss-simple-vars'), require('postcss-sass-colors'), require('postcss-em-media-query'), require('postcss-cssnext'), require('postcss-bem')(BEM_CONFIG), require('postcss-import')],
};
