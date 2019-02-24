'use strict';

const publishing = require('../../services/server/publish-url'),
  mainComponentRefs = ['article'];

module.exports.routes = [
  { path: '/'},
  { path: '/:year/:month/:name' },
  { path: '/article/:name' }
];

// Resolve the url to publish to
module.exports.resolvePublishUrl = [
  // Simple url format
  (uri, data, locals) => publishing.getSlugUrl(data, locals, mainComponentRefs)
];
