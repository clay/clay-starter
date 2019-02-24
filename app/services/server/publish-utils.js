'use strict';

const _ = require('lodash'),
  db = require('amphora-storage-postgres'),
  { getComponentName } = require('clayutils'),
  sanitize = require('../universal/sanitize'),
  utils = require('../universal/utils'),
  bluebird = require('bluebird'),
  log = require('../universal/log').setup({ file: __filename }),
  canonicalProtocol = 'http', // TODO: this is a HUGE assumption, make it not be an assumption
  canonicalPort = process.env.PORT || 3001;

/**
 * Checks provided ref to determine whether it is a main component (article or lede-video)
 * @param {string} ref
 * @param {object} mainComponentNames
 * @returns {boolean}
 */
function isMainComponentReference(ref, mainComponentNames) {
  let match = false;

  if (_.isString(ref)) {
    _.each(mainComponentNames, componentRef => {
      if (getComponentName(ref) === componentRef) match = true;
    });
  }

  return match;
}

/**
 * Gets the first reference to a main component within a page (if it exists)
 * @param {object} page
 * @param {object} mainComponentNames
 * @returns {string|undefined}
 */
function getComponentReference(page, mainComponentNames) {
  for (let key in page) {
    if (page.hasOwnProperty(key)) {
      let value = page[key];

      if (Array.isArray(value)) {
        let result = _.find(value, o => isMainComponentReference(o, mainComponentNames));

        if (result) {
          return result;
        }
      }
    }
  }

  // If we reach this point we didn't find one of the main components on the page
  // and an implicity `undefined` will be returned
}

/**
 * @param {object} mainComponent
 */
function guaranteeHeadline(mainComponent) {
  if (!mainComponent.headline) {
    throw new Error('Client: missing primary headline');
  }
}

/**
 * Logic about which date to use for a published article
 * @param {object} latest
 * @param {object} [published]
 * @returns {string}
 */
function getPublishDate(latest, published) {
  if (_.isObject(latest) && latest.date) {
    // if we're given a date, use it
    return latest.date;
  } else if (_.isObject(published) && published.date) {
    // if there is only a date on the published version, use it
    return published.date;
  } else {
    return new Date().toISOString();
  }
}

/**
 * @param {object} component
 * @param {object} publishedComponent
 * @param {object} locals
 */
function guaranteeLocalDate(component, publishedComponent, locals) {
  // if date is defined in the component, remember it.
  if (!locals.date) {
    locals.date = getPublishDate(component, publishedComponent);
  }
}

/**
 * gets a main component from the db by its ref, ensuring primary headline and date exist
 * @param {string} componentReference
 * @param {object} locals
 * @returns {Promise}
 */
function getMainComponentFromRef(componentReference, locals) {
  return bluebird.all([
    db.get(componentReference)
      .catch(error => {
        log('error', `Failure to fetch component at ${componentReference}`);
        throw error;
      }),
    db.get(componentReference + '@published')
      .catch(_.noop)
  ]).spread((component, publishedComponent) => {
    guaranteeHeadline(component);
    guaranteeLocalDate(component, publishedComponent, locals);
    return component;
  });
}

/**
 * Return the URL prefix of a site.
 * @param {Object} site
 * @returns {String}
 */
function getUrlPrefix(site) {
  const proto = site && site.proto || canonicalProtocol,
    port = site && site.port || canonicalPort,
    urlPrefix = utils.uriToUrl(site.prefix, { site: { protocol: proto, port: port } });

  return _.trimEnd(urlPrefix, '/'); // never has a trailing slash; newer lodash uses `trimEnd`
}

/**
 * returns an object to be consumed by url patterns
 * @param {object} component
 * @param {object} locals
 * @returns {{prefix: string, section: string, yyyy: string, mm: string, slug: string}}
 * @throws {Error} if there's no date, slug, or prefix
 */
function getUrlOptions(component, locals) {
  const urlOptions = {};

  urlOptions.prefix = getUrlPrefix(locals.site);
  urlOptions.slug = component.slug || sanitize.cleanSlug(component.headline);

  if (!(locals.site && locals.date && urlOptions.slug)) {
    throw new Error(`Client: Cannot generate a canonical url at prefix: ${locals.site.prefix} slug: ${urlOptions.slug} date: ${locals.date}`);
  }

  return urlOptions;
}

module.exports.getComponentReference = getComponentReference;
module.exports.getMainComponentFromRef = getMainComponentFromRef;
module.exports.getUrlOptions = getUrlOptions;
module.exports.getUrlPrefix = getUrlPrefix;
module.exports.getPublishDate = getPublishDate;
// URL patterns below need to be handled by the site's index.js
module.exports.slugUrlPattern = o => `${o.prefix}/article/${o.slug}.html`; // http://localhost/article/x.html
