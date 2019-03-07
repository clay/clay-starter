'use strict';
const _isArray = require('lodash/isArray'),
  _isObject = require('lodash/isObject'),
  _isEmpty = require('lodash/isEmpty'),
  _isString = require('lodash/isString'),
  _isNull = require('lodash/isNull'),
  _isUndefined = require('lodash/isUndefined'),
  _get = require('lodash/get'),
  _parse = require('url-parse'),
  publishedVersionSuffix = '@published',
  kilnUrlParam = '&currentUrl=';

/**
 * determine if a field is empty
 * @param  {*}  val
 * @return {Boolean}
 */
function isFieldEmpty(val) {
  if (_isArray(val) || _isObject(val)) {
    return _isEmpty(val);
  } else if (_isString(val)) {
    return val.length === 0; // emptystring is empty
  } else if (_isNull(val) || _isUndefined(val)) {
    return true; // null and undefined are empty
  } else {
    // numbers, booleans, etc are never empty
    return false;
  }
}

/**
 * convenience function to determine if a field exists and has a value
 * @param  {*}  val
 * @return {Boolean}
 */
function has(val) {
  return !isFieldEmpty(val);
}

/**
 * replace version in uri
 * e.g. when fetching @published data, or previous component data
 * @param  {string} uri
 * @param  {string} [version] defaults to latest
 * @return {string}
 */
function replaceVersion(uri, version) {
  if (!_isString(uri)) {
    throw new TypeError('Uri must be a string, not ' + typeof uri);
  }

  if (version) {
    uri = uri.split('@')[0] + '@' + version;
  } else {
    // no version is still a kind of version
    uri = uri.split('@')[0];
  }

  return uri;
}

/**
 * generate a url from a uri (and some site data)
 * @param  {string} uri
 * @param  {Object} locals
 * @return {string}
 */
function uriToUrl(uri, locals) {
  const protocol = _get(locals, 'site.protocol') || 'http',
    port = _get(locals, 'site.port'),
    parsed = _parse(`${protocol}://${uri}`);

  if (port !== 80) {
    parsed.set('port', port);
  }

  return parsed.href;
}

/**
 * generate a uri from a url
 * @param  {string} url
 * @return {string}
 */
function urlToUri(url) {
  const parsed = _parse(url);

  return `${parsed.hostname}${parsed.pathname}`;
}

/**
 * Make sure start is defined and within a justifiable range
 *
 * @param {int} n
 * @returns {int}
 */
function formatStart(n) {
  var min = 0,
    max = 100000000;

  if (typeof n === 'undefined' || Number.isNaN(n) || n < min || n > max) {
    return 0;
  } else {
    return n;
  }
}
/*
 *
 * @param {Object} locals
 * @param {string} [locals.site.protocol]
 * @param {string} locals.site.host
 * @param {string} [locals.site.port]
 * @param {string} [locals.site.path]
 * @returns {string} e.g. `http://localhost/somesite`
 */
function getSiteBaseUrl(locals) {
  const site = locals.site || {},
    protocol = site.protocol || 'http',
    host = site.host,
    port = (site.port || '80').toString(),
    path = site.path || '';

  return `${protocol}://${host}${port === '80' ? '' : ':' + port}${path}`;
}

/**
 *
 * @param {string} uri
 * @returns {boolean}
 */
function isPublishedVersion(uri) {
  return uri.indexOf(publishedVersionSuffix) === uri.length - 10;
}

/**
 * takes a uri and always returns the published version of that uri
 * @param {string} uri
 * @returns {string}
 */
function ensurePublishedVersion(uri) {
  return isPublishedVersion(uri) ? uri : uri.split('@')[0] + publishedVersionSuffix;
}

/**
 * checks if uri is an instance of a component
 * @param {string} uri
 * @returns {boolean}
 */
function isInstance(uri) {
  return uri.indexOf('/instances/') > -1;
}

/**
 * kiln sometimes stores the url in a query param
 * @param {string} url
 * @returns {string}
 */
function kilnUrlToPageUrl(url) {
  return url.indexOf(kilnUrlParam) > -1 ? decodeURIComponent(url.split(kilnUrlParam).pop()) : url;
}

/**
 * removes query params and hashes
 * e.g. `http://canonicalurl?utm-source=facebook#heading` becomes `http://canonicalurl`
 * @param {string} url
 * @returns {string}
 */
function urlToCanonicalUrl(url) {
  return kilnUrlToPageUrl(url).split('?')[0].split('#')[0];
}

/**
 * prefixes a given elastic index depending on the current environment
 * e.g. `published-articles` becomes `local_published-articles`
 * @param {string} indexString
 * @returns {string}
 */
function prefixElasticIndex(indexString) {
  const prefix = process.env.ELASTIC_PREFIX;

  return prefix
    ? indexString.split(',').map((index) => `${prefix}_${index}`.trim()).join(',')
    : indexString;
}

module.exports.isFieldEmpty = isFieldEmpty;
module.exports.has = has;
module.exports.replaceVersion = replaceVersion;
module.exports.uriToUrl = uriToUrl;
module.exports.urlToUri = urlToUri;
module.exports.formatStart = formatStart;
module.exports.getSiteBaseUrl = getSiteBaseUrl;
module.exports.isPublishedVersion = isPublishedVersion;
module.exports.ensurePublishedVersion = ensurePublishedVersion;
module.exports.isInstance = isInstance;
module.exports.urlToCanonicalUrl = urlToCanonicalUrl;
module.exports.prefixElasticIndex = prefixElasticIndex;
