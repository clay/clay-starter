'use strict';

const pkg = require('../../package.json'),
  amphoraHtml = require('amphora-html'),
  helpers = require('../universal/helpers'),
  resolveMediaService = require('../server/resolve-media');

amphoraHtml.configureRender({
  editAssetTags: true,
  cacheBuster: pkg.version
});

amphoraHtml.addResolveMedia(resolveMediaService);
amphoraHtml.addHelpers(helpers);
amphoraHtml.addEnvVars(require('../../client-env.json'));

module.exports = {
  default: 'html',
  html: amphoraHtml
};
