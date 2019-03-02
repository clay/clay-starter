'use strict';

const _includes = require('lodash/includes'),
  _startsWith = require('lodash/startsWith');

/**
 * Skimlinks adds affiliate ids to links so that we gain revenue from links to Zappos, J.Crew, etc.
 * We use the Amazon ID directly on Amazon links.
 *
 * Skimlinks should only be applied to external links.
 *
 * Note: `internalHostnames` in the site's config must be updated when a new host is added.
 *
 * Skimlinks API Documentation:
 * http://go.redirectingat.com/doc/
 */

var excludedHostnames, skimlinksBaseUrl, amazonTag, skimlinksId,
  ignoreDataAttribute = 'data-affiliate-links-ignore',
  skimLinksHostname = 'go.redirectingat.com',
  article;

function isSponsored() {
  article = article || window.document.querySelector('article');

  return article && article.getAttribute('data-type') === 'Sponsor Story';
}

/**
* Excluded hostnames: All links that match this list will not get affiliate id's added.
* @param {Element} componentEl
*/
function setExcludedHostnames(componentEl) {
  excludedHostnames = (componentEl.getAttribute('data-excluded-hostnames') || '').toLowerCase().split(',');
}

/**
* Check for skimlinks
* @param {Element} componentEl
* @returns {boolean}
*/
function isSkimLink(componentEl) {
  skimlinksId = componentEl.getAttribute('data-skimlinks');

  return !!skimlinksId;
}

/**
* Check for Amazon affiliate tag.
* @param {Element} componentEl
* @returns {boolean}
*/
function setAmazonTag(componentEl) {
  componentEl = componentEl || document.querySelector('.affiliate-links');

  if (componentEl) {
    amazonTag = componentEl.getAttribute('data-amazon');
  }

  return !!amazonTag;
}

/**
* Test if the link is an excluded hostname
* @param {string} hostname ideally is the hostname, but can also be the URL.
* @returns {boolean}
*/
function isExcluded(hostname) {
  return _includes(excludedHostnames, hostname) ||
    _startsWith(hostname, 'www.') && _includes(excludedHostnames, hostname.slice(4)) ||
    isSponsored();
}

/**
* Test if the link is a standard URL. e.g. not a mailto: or javascript:.
* @param {string} url
* @returns {boolean}
*/
function isUrlProtocol(url) {
  return url.indexOf('mailto:') !== 0 && url.indexOf('javascript:') !== 0;
}

/**
* Returns hostname from an HTML element.
* @param {object} target
* @returns {string}
*/
function getTargetHostname(target) {
  return (target.hostname || target.host || target.href || '').toLowerCase();
}

/**
 * Convert url to skimlinks
 * @param {string} url
 * @param {string} hostname
 * @returns {string}
 */
function convertSkimlink(url, hostname) {
  var urlIsSkimlink = hostname.indexOf(skimLinksHostname) === 0;

  // construct the skimlinks url and try to create the base url or set the base url to undefined.
  skimlinksBaseUrl = skimlinksBaseUrl || skimlinksId ? '//go.redirectingat.com/?xs=1&id=' + skimlinksId + '&sref=' + encodeURIComponent(window.location.href) + '&url=' : undefined;

  return !urlIsSkimlink && skimlinksBaseUrl && skimlinksBaseUrl + encodeURIComponent(url);
}

/**
 * For cases where we do not want affiliate-links to run and we do not know the hostname, then
 * `data-affiliate-links-ignore` can be set to 'true'.
 * This was created for bam-x, a third-party script that rewrites the href and we do not want it to go through skimlinks.
 * `data-affiliate-links-ignore` is set by `components/product/client.js`
 * TODO: consider server-side implemenation of bam-x, so that we do not have their script on our pages.
 * @param {Element} target
 * @returns {boolean}
 */
function hasIgnoreAttribute(target) {
  return target.getAttribute(ignoreDataAttribute) === 'true';
}

/**
* Convert external link to a skimlink
* @param {element} el
*/
function processSkimlink(el) {
  var url, hostname,
    href = el && el.href;

  hostname = getTargetHostname(el);

  if (isUrlProtocol(href) && !isExcluded(hostname) && !hasIgnoreAttribute(el)) {
    url = convertSkimlink(href, hostname);
    if (url) {
      el.href = url;
    }
  }
}

// set skimlink id
function init() {
  const el = document.querySelector('.affiliate-links');

  if (el) {
    setAmazonTag(el);
    setExcludedHostnames(el);
    isSkimLink(el);
  }
}

function getSiteTag() {
  return amazonTag
    ? amazonTag
    : setAmazonTag() && amazonTag;
}

init();

module.exports = {
  processSkimlink,
  getSiteTag
};
