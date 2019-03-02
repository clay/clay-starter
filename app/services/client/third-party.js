'use strict';

const _debounce = require('lodash/debounce');
let body = document.body,
  scriptTagsAdded = {},
  debounceFns = {};

/**
 * Remove protocol if present, and return schemeless url
 * @param {string} url
 * @returns {boolean}
 */
function removeProtocol(url) {
  var splitUrl = url.split('//');

  return '//' + (splitUrl.length > 1 ? splitUrl[1] : splitUrl[0]);
}

/**
 * Return boolean based on whether the script tag has already been added or not
 * @param {string} url
 * @returns {boolean}
 */
function shouldAppendScript(url) {
  return !scriptTagsAdded[url];
}

/**
 * Construct script element with given URL and append to body
 * @param {string} url
 */
function appendScript(url) {
  var scriptEl = document.createElement('script');

  scriptEl.type = 'text/javascript';
  scriptEl.src = url;
  scriptEl.async = true;
  body.appendChild(scriptEl);

  scriptTagsAdded[url] = true;
}

/**
 * Register URL for a third party library to be imported via script tag
 * @param {string} url
 */
function includeScript(url) {
  url = removeProtocol(url);
  if (shouldAppendScript(url)) {
    appendScript(url);
  }
}

/**
 * `includeScript` with debounce
 * @param {string} url
 * @param {number} time (in milliseconds)

 */
function debouncedIncludeScript(url, time) {
  const debounceTime = time || 0;

  if (url) {
    if (!debounceFns[url]) {
      debounceFns[url] = _debounce(includeScript.bind(null, url), debounceTime);
    }
    debounceFns[url]();
  }
}

module.exports.includeScript = debouncedIncludeScript;
