// testing fix
require('babel-core/register')({
  presets: ['es2015', 'react']
});
function noop() {
  return null;
}

require.extensions['.pcss'] = noop;
require.extensions['.css'] = noop;
require.extensions['.scss'] = noop;

require.extensions['.jpg'] = noop;
require.extensions['.jpeg'] = noop;
require.extensions['.gif'] = noop;
require.extensions['.png'] = noop;
require.extensions['.svg'] = noop;
