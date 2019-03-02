'use strict';

const _get = require('lodash/get'),
  _memoize = require('lodash/memoize');

/**
 * we store some page-level data in a "primary page" component
 * most often this is the article component
 * @returns {Element|null}
 */
function getPrimaryPageComponent() {
  return document.querySelector('.article') || document.querySelector('.lede-video');
}

/**
 * Get content channel
 * @returns {string}
 */
function getPrimaryPageComponentChannel() {
  const el = getPrimaryPageComponent();

  return el && el.getAttribute('data-content-channel') || 'Undefined Channel';
}

/**
 * @returns {string|null} e.g. `nymag.com/scienceofus/_pages/some-id@published`
 */
function getPageUri() {
  return document.documentElement.getAttribute('data-uri');
}

/**
 * @returns {string} e.g. `ciu7g35p10004fvy6m7188nan`
 */
function getPageId() {
  return getPageUri().split('/_pages/')[1];
}

/**
 * @returns {string} e.g. `nymag.com/scienceofus`
 */
function getSiteBase() {
  return (getPageUri() || '').split('/_pages/')[0];
}

/**
 * @param {string} key - meta key to query
 * @returns {string} the content of the tag
 */
function getMetaContent(key) {
  var meta = document.querySelector('meta[name="' + key + '"]') ||
    document.querySelector('meta[property="' + key + '"]');

  return _get(meta, 'content', '');
}

// assumes values do not change after page load
module.exports.getMeta = _memoize(getMetaContent);
module.exports.getVertical = module.exports.getMeta.bind(this, 'vertical');
module.exports.getPageType = module.exports.getMeta.bind(this, 'type');
module.exports.getAuthor = module.exports.getMeta.bind(this, 'author');
module.exports.getSiteName = module.exports.getMeta.bind(this, 'og:site_name');
module.exports.getSiteBase = _memoize(getSiteBase);
module.exports.getPageUri = _memoize(getPageUri);
module.exports.getPageId = _memoize(getPageId);
module.exports.getChannel = _memoize(getPrimaryPageComponentChannel);
module.exports.getPrimaryPageComponent = getPrimaryPageComponent;
