'use strict';

const getDependencies = require('claycli/lib/cmd/compile/get-script-dependencies').getDependencies;

/**
 * Update the `media` object based on parameters included
 * in the request for a page/component
 *
 * @param  {Object} media
 * @param  {Object} locals
 */
// Allow a higher complexity than normal
/* eslint complexity: ["error", 9] */
function resolveMedia(media, locals) {
  const assetPath = locals.site.assetHost || locals.site.assetPath,
    stylesSource = locals.site.styleguide || locals.site.slug;

  // We're dealing with a page, let's include the site CSS,
  // and the scripts as needed
  media.styles.unshift('/css/_inlined-fonts.' + stylesSource + '.css');

  if (locals.edit) {
    // edit mode - whole page
    // note: turning minify: false will link all model.js and dep files individually,
    // which we don't currently want to do (but is useful for debugging stuff on local dev envs)
    media.scripts = getDependencies(media.scripts, assetPath, { edit: true, minify: true });
    media.styles.unshift('/css/_kiln-plugins.css');
  } else {
    // view mode - whole page
    media.scripts = getDependencies(media.scripts, assetPath);
  }
};

module.exports = resolveMedia;
