'use strict';

const productSubtags = require('../../services/client/product-subtags'),
  { processSkimlink } = require('./product-skimlinks'),
  _includes = require('lodash/includes'),
  thirdParty = require('../../services/client/third-party'),
  bamxDomain = 'shop-links.co/';

function isAmazonLink(url) {
  return typeof url === 'string' && url.includes('amazon.com');
}

/**
 * Handle product url clicks
 * @param {string} productUrl
 * @param {string} eventType
 * @returns {function}
 */
function handleBuyClick(productUrl, eventType) {
  return function () {
    if (window.fbq) {
      window.fbq('trackCustom', eventType, {domain: productUrl});
    }
  };
}

/**
 * Append third-party ecomm scripts to the page
 * @param {string} productUrl
 * @param {boolean} includeNarrativ
 */
function attachThirdPartyScripts(productUrl, includeNarrativ = false) {
  const isAmazon = isAmazonLink(productUrl),
    amazonOnetagId = '74e5d3e9-e5c4-4fa2-85e4-0e43ae3f0f84',
    amazonOnetagSrc = `z-na.amazon-adsystem.com/widgets/onejs?MarketPlace=US&adInstanceId=${amazonOnetagId}`,
    bamxSrc = 'static.bam-x.com/tags/nymag.js';

  if (isAmazon) {
    thirdParty.includeScript(amazonOnetagSrc, 2500);
  }

  if (_includes(productUrl, bamxDomain) || includeNarrativ) {
    thirdParty.includeScript(bamxSrc);
  }
}

function shouldTrySkimlinks(el) {
  const url = el.href,
    isNarrativLink = _includes(url, bamxDomain),
    isOtherAffiliate = !!productSubtags.getAffiliate(url);

  return !isNarrativLink && !isOtherAffiliate;
}

/**
 * Handle behavior universal to all product links
 * @param {Element} buyLink
 * @param {object} visitState
 */
function initLink(buyLink, visitState) {
  var productUrl = buyLink && buyLink.href, // not `getAttribute`, because want resolved url
    // dynamic narrativ links have the class 'narrativ-link'

    isNarrativeSecondBuyButton = buyLink.classList.contains('narrativ-link');

  if (productUrl) {
    if (shouldTrySkimlinks(buyLink)) {
      processSkimlink(buyLink);
    }

    // add click handler
    buyLink.addEventListener('click', handleBuyClick(productUrl, 'Click-Out'));
    // handle right clicks event
    buyLink.addEventListener('contextmenu', handleBuyClick(productUrl, 'Click-Out-Right'));

    // add/extend product link subtag with client-side params
    productSubtags.ensureSubtag(buyLink, visitState);
    productSubtags.ensureSiteTag(buyLink);

    attachThirdPartyScripts(productUrl, isNarrativeSecondBuyButton);
  }
}

module.exports.initLink = initLink;
