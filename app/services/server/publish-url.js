'use strict';

const pubUtils = require('./publish-utils');

/**
 * Return the url for a page based on its main component's slug.
 *
 * @param {Object} pageData
 * @param {Object} locals
 * @param {Object} mainComponentRefs
 * @returns {Promise}
 */
function getSlugUrl(pageData, locals, mainComponentRefs) {
  const componentReference = pubUtils.getComponentReference(pageData, mainComponentRefs);

  if (!componentReference) {
    return Promise.reject(new Error('Could not find a main component on the page'));
  }

  return pubUtils.getMainComponentFromRef(componentReference, locals).then(mainComponent => {
    const urlOptions = pubUtils.getUrlOptions(mainComponent, locals);

    return pubUtils.slugUrlPattern(urlOptions);
  });
}

module.exports.getSlugUrl = getSlugUrl;
