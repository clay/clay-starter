'use strict';

const _get = require('lodash/get'),
  _isObject = require('lodash/isObject');

/**
 * Comma separate a list of author strings
 * or simple-list objects
 *
 * @param  {String[]} opts
 * @return {String}
 */
function formatSimpleByline(opts = {}) {
  debugger;
  const bylines = _get(opts.hash, 'bylines', []),
    authors = bylines.map((author) => _isObject(author) ? author.text : author);

  if (authors.length === 1) {
    return '<span>' + authors[0] + '</span>';
  } else if (authors.length === 2) {
    return '<span>' + authors[0] + '</span><span class="and"> and </span><span>' + authors[1] + '</span>';
  } else {
    return authors.map((author, idx) => {
      if (idx < authors.length - 1) {
        return '<span>' + author + ', </span>';
      } else {
        return '<span class="and">and </span><span>' + author + '</span>';
      }
    }).join('');
  }
}

module.exports = formatSimpleByline;
