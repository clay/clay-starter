'use strict';

var htmlWordCount = require('html-word-count'),
  // components with `text` property, and components that trigger a recount
  COMPONENTS_WITH_WORDS = {
    article: null, // just trigger recount
    'article-sidebar': null,
    blockquote: 'text', // trigger recount, AND count text in this property
    paragraph: 'text',
    subheader: 'text',
    subsection: null
  },
  {getComponentName} = require('clayutils');

/**
 * determine if mutation uri is a component that we care about
 * @param  {string}  uri
 * @return {Boolean}
 */
function isComponentWithWords(uri) {
  return COMPONENTS_WITH_WORDS[getComponentName(uri)] !== undefined;
}

/**
 * get the component field that contains the text we should count
 * @param  {string} uri
 * @return {string|null}
 */
function getComponentField(uri) {
  return COMPONENTS_WITH_WORDS[getComponentName(uri)];
}

/**
 * Given an object mapping component URIs to their data or an array of
 * components with _ref attributes, return an array of components in the latter
 * format.
 * @param {Object} cmptSrc
 * @return {Object[]}
 */
function normalizeCmptSrc(cmptSrc) {
  if (Array.isArray(cmptSrc)) {
    return cmptSrc;
  } else if (typeof cmptSrc === 'object') {
    return Object.keys(cmptSrc)
      .map(key => Object.assign({}, cmptSrc[key], {_ref: key}));
  }
  return [];
}

/**
 * count words in components we care about
 * @param  {Object|Object[]} components Object mapping URI to data or
 * array of cmpts with _ref
 * @return {number}
 */
function count(components) {
  return normalizeCmptSrc(components)
    .filter(cmpt => isComponentWithWords(cmpt._ref))
    .map(cmpt => cmpt[getComponentField(cmpt._ref)])
    .reduce((acc, fieldValue) => acc + htmlWordCount(fieldValue || ''), 0);
}

module.exports.count = count;
module.exports.isComponentWithWords = isComponentWithWords;

// for testing
module.exports.setComponentsWithWords = i => COMPONENTS_WITH_WORDS = i;
