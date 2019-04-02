'use strict';

const speakingurl = require('speakingurl'),
  he = require('he'),
  typogr = require('typogr'),
  headQuotes = require('headline-quotes'),
  striptags = require('striptags'),
  _isString = require('lodash/isString'),
  _isPlainObject = require('lodash/isPlainObject'),
  _isArray = require('lodash/isArray'),
  _mapValues = require('lodash/mapValues'),
  _toLower = require('lodash/toLower'),
  { fold } = require('fold-to-ascii'),
  NON_ALPHANUMERIC_RE = /[_\W]/g;

/**
 * smarten headlines, curling quotes and replacing dashes and ellipses
 * @param {string} text
 * @returns {string}
 */
function toSmartHeadline(text) {
  return headQuotes(he.decode(text))
    .replace('---', '—') // em-dash first
    .replace('--', '–')
    .replace('...', '…');
}

/**
 * run typogr's smartypants on text, curling quotes and replacing dashes and ellipses
 * note: this is used for body text and teasers, NOT headlines
 * note: we have to decode quotes, then curl them, then decode them again
 * @param {string} text
 * @returns {string}
 */
function toSmartText(text) {
  return he.decode(
    typogr(he.decode(text))
      .chain()
      .smartypants()
      .value()
  );
}

/**
 * Removes all unicode from string
 * @param {string} str
 * @returns {string}
 */
function stripUnicode(str) {
  return str.replace(/[^A-Za-z 0-9\.,\?!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]~]*/g, '');
}

/**
 * remove all html stuff from a string
 * @param {string} str
 * @returns {string}
 */
function toPlainText(str) {
  // coerce all text into a string. Undefined stuff is just an empty string
  if (!_isString(str)) {
    return '';
  }
  return he.decode(striptags(str.replace(/&nbsp;/g, ' ')));
}

/**
 * remove EVERYTHING from the slug, then run it through speakingurl
 * @param {string} str
 * @returns {string}
 */
function cleanSlug(str) {
  return speakingurl(toPlainText(stripUnicode(str)), {
    custom: {
      _: '-' // convert underscores to hyphens
    }
  });
}

/**
 * remove empty tags and rando whitespace
 * used when saving wysiwyg content
 * @param {string} str
 * @returns {string}
 */
function validateTagContent(str) {
  var noTags = striptags(str);

  // if a string ONLY contains tags, return emptystring.
  // this fixes some issues where browsers insert tags into empty
  // contenteditable elements, as well as some unrecoverable states where
  // users added rich text and then deleted it in a specific way that
  // preserved the tag, e.g. '<strong> </strong>'
  if (noTags === '' || noTags.match(/^\s+$/)) {
    return '';
  } else {
    return str; // otherwise return the string with all tags and everything
  }
}

/**
 * Strip paragraph and line seperators from component data
 * @param {object|array|string} data
 * @returns {object|array|string} sanitized data
 */
function recursivelyStripSeperators(data) {
  if (_isPlainObject(data)) {
    return _mapValues(data, recursivelyStripSeperators);
  } else if (_isArray(data)) {
    return data.map(recursivelyStripSeperators);
  } else if (_isString(data)) {
    return data.replace(/(\u2028|\u2029)/g, '');
  }
  return data;
}

/**
 * Removes all non alphanumeric characters from a string
 * @param   {string} str
 * @returns {string}
 */
function removeNonAlphanumericCharacters(str = '') {
  return str.replace(NON_ALPHANUMERIC_RE, '');
}

/**
 * normalizeName
 *
 * lowercases and converts alphabetic, numeric, and symbolic Unicode characters
 * which are not in the first 127 ASCII characters (the "Basic Latin" Unicode block)
 * into their ASCII equivalents
 *
 * @param {String} name a string to normalize
 * @returns {String}
 */
function normalizeName(name) {
  return fold(_toLower(name.trim()));
}

module.exports.toSmartHeadline = toSmartHeadline;
module.exports.toSmartText = toSmartText;
module.exports.stripUnicode = stripUnicode;
module.exports.toPlainText = toPlainText;
module.exports.cleanSlug = cleanSlug;
module.exports.validateTagContent = validateTagContent;
module.exports.recursivelyStripSeperators = recursivelyStripSeperators;
module.exports.removeNonAlphanumericCharacters = removeNonAlphanumericCharacters;
module.exports.normalizeName = normalizeName;
