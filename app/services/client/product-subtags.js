'use strict';

/**
 * ========
 * Overview
 * ========
 *
 * This service creates subtag query params for product links, for affiliates such as
 * Amazon, Rakuten, and Shareasale
 *
 * At the time of its creation, this service is used by the product components and by the gtm service for inline links
 *
 */

const dom = require('@nymag/dom'),
  urlParse = require('url-parse'),
  _memoize = require('lodash/memoize'),
  _includes = require('lodash/includes'),
  _map = require('lodash/map'),
  _mapValues = require('lodash/mapValues'),
  _reduce = require('lodash/reduce'),
  _assign = require('lodash/assign'),
  _get = require('lodash/get'),
  _pickBy = require('lodash/pickBy'),
  _find = require('lodash/find'),
  page = require('./page'),
  { getSiteTag } = require('./product-skimlinks'),

  // this object determines the construction of subtag params for each affiliate sales partner
  // note: the order in which fields are defined here determine the order they appear in the subtag string
  affiliateSettings = {
    amazon: {
      domains: ['amazon.com'],
      subtagKey: 'ascsubtag',
      fields: ['siteShortKey', 'pageUri', 'productId', 'deviceAbbreviation', 'utmSource', 'utmMedium', 'utmCampaign', 'referrer', 'zone'],
      maxLength: 99,
      delimiter: 'standard'
    },
    rakuten: {
      domains: ['click.linksynergy.com/deeplink'],
      subtagKey: 'u1',
      fields: ['siteShortKey', 'pageUri', 'productId', 'deviceAbbreviation', 'zone'],
      maxLength: 72,
      delimiter: 'standard'
    },
    shareasale: {
      domains: ['shareasale.com'],
      subtagKey: 'afftrack',
      fields: ['siteShortKey', 'pageUri', 'productId', 'deviceAbbreviation', 'utmSource', 'utmMedium', 'utmCampaign', 'referrer', 'zone'],
      maxLength: 99,
      delimiter: 'standard'
    },
    skimlinks: {
      domains: ['go.redirectingat.com'],
      subtagKey: 'xcust',
      fields: ['pageUri', 'productId', 'utmCampaign', 'utmSource', 'utmMedium', 'zone', 'deviceAbbreviation'],
      maxLength: 50,
      delimiter: 'alt'
    }
  },
  // really wish we did not need to hard-code this here
  internalHosts = [
    'nymag.com',
    'vulture.com',
    'grubstreet.com',
    'thecut.com'
  ],
  gtm = dom.find('.gtm'),
  siteShortKey = gtm && gtm.getAttribute('data-site-short-key'),
  shortenedPageUri = shortenUri(page.getPageUri()),
  getters = {
    siteShortKey: () => siteShortKey,
    pageUri: () => shortenedPageUri,
    productId: ({productLink}) => productLink && productLink.getAttribute('data-track-id'),
    deviceAbbreviation: _memoize(({visitState}) => guessDeviceAbbreviation(visitState.os, visitState.screenWidth)),
    utmSource: _memoize(({visitState}) => (visitState.utm_source || '').substr(0, 3)),
    utmMedium: _memoize(({visitState}) => (visitState.utm_medium || '').substr(0, 2)),
    utmCampaign: _memoize(({visitState}) => (visitState.utm_campaign || '').substr(0, 17)),
    referrer: _memoize(({visitState}) => shortenReferrer(visitState.referrer)),
    zone: ({productLink}) => getPageZone(productLink)
  },
  zoneAttr = 'data-track-zone',

  // Mapping between subtag property and subtag key
  // Any changes here should be documented in /_components/product/schema.yml description
  subtagDictionary = {
    siteShortKey: '',
    pageUri: 'p',
    productId: 'i',
    zone: 'z',
    deviceAbbreviation: 'd',
    utmSource: 's',
    utmMedium: 'm',
    utmCampaign: 'c',
    referrer: 'r' // referrer at the end in case need to truncate
  },
  delimiters = {
    standard: ['[', ']'],
    alt: ['__', '_']
  };

/**
 *
 * @param {string} os
 * @param {number} width
 * @returns {string} one letter string to indicate device
 */
function guessDeviceAbbreviation(os, width) {
  /* eslint complexity: [2, 20] */
  // yes, this is "complex", but is best effort.
  switch (os) {
    case 'Windows Phone':
    case 'iOS':
    case 'Android':
    case 'BlackBerry':
      return width < 728 ? 'M' : 'T';
    case 'Linux':
    case 'Windows':
    case 'Mac OS X':
      return 'D';
    default:
      if (width < 728) {
        return 'M';
      }
      return width > 1024 ? 'D' : 'T';
  }
}

/**
 * retrieve page zone containing the product-link
 * @param {string} el
 * @returns {string} one letter string to indicate device
 */
function getPageZone(el) {
  var zone = dom.closest(el, '[' + zoneAttr + ']'),
    zoneStr = zone && zone.getAttribute(zoneAttr) || '';

  return zoneStr.substr(0, 1);
}

/**
 * removes the `www.` from host
 * @param {string} host - lowercase string
 * @returns {string}
 */
function shortenHost(host) {
  return host.substr(0,4) === 'www.' ? host.substr(4) : host;
}

/**
 * shortens referrer to shortest usable string:
 *  removes www.
 *  keeps rest of host
 *  keeps first directory in path
 *  removes query and hash
 *  host and path are separated by `/`
 * @param {string} [referrer]
 * @returns {string} defaults to empty string if no referrer found
 */
function shortenReferrer(referrer) {
  var parts = referrer && referrer.match(/\/\/([^\/]+)(\/[^\/#?]+)?/),
    shortenedReferrer = '',
    formattedHost, firstDirectory;

  if (parts) {
    formattedHost = shortenHost(parts[1] || '').toLowerCase();
    firstDirectory = parts[2] || '';
    shortenedReferrer = formattedHost + (_includes(internalHosts, formattedHost) ? firstDirectory : '');
  }

  return shortenedReferrer;
}

/**
 * shortens uri to shortest usable string:
 *  reduce to instance key
 *  replace `ambrose-` with `a-`
 *  removes `@published` version
 * @param {string} [uri]
 * @returns {string}
 */
function shortenUri(uri) {
  return (uri || '').split('/').pop().replace('ambrose-', 'a-').replace('@published', '');
}

function parseValueFromSubtag(param, delimiter, subtagString) {
  const subtagKey = delimiter[0] + param + delimiter[1],
    startString = subtagString.split(subtagKey)[1] || '';

  return startString
    ? startString.split(delimiter[0])[0]
    : null;
}

/**
 * parses a product link subtag and returns data as an object
 * @param {string} [subtag]
 * @param {array} delimiter
 * @returns {object}
 */
function parseSubtag(subtag, delimiter = delimiters['standard']) {
  return _pickBy(_mapValues(subtagDictionary, (val) => {
    return parseValueFromSubtag(val, delimiter, subtag);
  }));
}

/**
 * generate subtag string based on fixed property names
 * @param {object} subtagData
 * @param {object} affiliate
 * @param {array} delimiter
 * @returns {string}
 */
function generateSubtag(subtagData, affiliate, delimiter = delimiters['standard']) {
  const wrap = (delimiter) => {
      return (key) => `${delimiter[0]}${key}${delimiter[1]}`;
    },
    wrapKey = wrap(delimiter),
    fields = _get (affiliateSettings[affiliate], 'fields');

  return _reduce(fields, (acc, field) => {
    const subtagKey = wrapKey(subtagDictionary[field]),
      value = subtagData[field];

    return acc += value ? subtagKey + value : '';
  }, '');
}

/**
 * return subtag string, truncated to length limit as needed
 * @param {string} subtag
 * @param {number} length
 * @returns {string}
 */
function applySubtagMaxlength(subtag, length) {
  var maxLength = length - 3 * (subtag.split(',').length - 1 + subtag.split('|').length - 1);

  return subtag.substr(0, maxLength);
}

/**
 * generate subtag data
 * @param {array} fields
 * @param {Object} obj
 * @param {Object} obj.visitState
 * @param {Element} obj.productLink
 * @returns {Object}
 */
function getSubtagData({ fields = [], visitState, productLink }) {
  let obj = {};

  fields.forEach(field => {
    obj[field] = getters[field] && getters[field]({visitState, productLink});
  });

  return obj;
}

/**
 * parse query string into an object
 * @param {string} str
 * @returns {Object}
 */
function parseQuery(str = '') {
  return str.split('&').reduce((acc, keyval) => {
    const key = keyval.split('=')[0],
      val = keyval.split('=')[1];

    if (typeof val !== 'undefined') {
      acc[key] = val;
    }

    return acc;
  }, {});
}

/**
 * append or extend product tracking subtag
 * @param {Object} obj
 * @param {string} obj.affiliate
 * @param {Element} obj.productLink
 * @param {Object} obj.visitState
 */
function processSubtag({ affiliate, productLink, visitState = {} }) {
  const url = productLink.href || '',
    fields = _get(affiliateSettings[affiliate], 'fields'),
    subtagKey = _get(affiliateSettings[affiliate], 'subtagKey'),
    maxLength = _get(affiliateSettings[affiliate], 'maxLength'),
    delimiterName = _get(affiliateSettings[affiliate], 'delimiter'),
    delimiter = delimiters[delimiterName];
  let query = url.indexOf('?') >= 0 ? url.split('?').pop() : '',
    queryData = parseQuery(query),
    subtagData = getSubtagData({ fields, visitState, productLink }),
    subtagString;

  if (subtagKey) {
    subtagString = queryData[subtagKey] || '';
    subtagData = _assign(parseSubtag(subtagString, delimiter), _pickBy(subtagData));
    subtagString = generateSubtag(subtagData, affiliate, delimiter);
    queryData[subtagKey] = applySubtagMaxlength(subtagString, maxLength);
    query = _map(queryData, (value, key) => `${key}=${value}`).join('&');
    productLink.search = query ? `?${query}` : '';
  }
}

/**
 * Return affiliate matching product url
 * @param {string} url
 * @returns {string}
 */
function getAffiliate(url) {
  const affiliates = Object.keys(affiliateSettings);

  return _find(affiliates, affiliate => _find(affiliateSettings[affiliate].domains, domain => url.includes(domain.toLowerCase()))) || '';
}

/**
 * add or extend subtag on amazon and narrativ links
 * server-side subtag params will be augmented by client-side params
 * @param {Element} [productLink]
 * @param {object} [visitState]
 */
function ensureSubtag(productLink, visitState) {
  const url = productLink.href,
    affiliate = getAffiliate(url);

  if (affiliate) {
    processSubtag({productLink, visitState, affiliate});
  }
}

function ensureSiteTag(el) {
  const url = el.href,
    key = 'tag=',
    parsedUrl = urlParse(url),
    q = parsedUrl.query,
    affiliate = getAffiliate(url),
    isAmazon = affiliate === 'amazon',
    hasSiteTag = q.includes(key),
    siteTag = getSiteTag();

  if (isAmazon && !hasSiteTag) {
    parsedUrl.set('query', q + (q.length ? '&' : '?') + `&${key}${siteTag}`);
    el.href = parsedUrl.toString();
  }
}

module.exports.guessDeviceAbbreviation = guessDeviceAbbreviation;
module.exports.shortenUri = shortenUri;
module.exports.getPageZone = getPageZone;
module.exports.generateSubtag = generateSubtag;
module.exports.ensureSubtag = ensureSubtag;
module.exports.ensureSiteTag = ensureSiteTag;
module.exports.getAffiliate = getAffiliate;

// exports for testing
module.exports.parseSubtag = parseSubtag;
module.exports.processSubtag = processSubtag;
