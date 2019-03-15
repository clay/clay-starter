'use strict';

const _get = require('lodash/get'),
  _isObject = require('lodash/isObject');

/**
 * Comma separate a list of author strings
 * or simple-list objects
 *
 * @param  {string[]} opts
 * @return {string}
 */
function formatSimpleByline(opts = {}) {
  const bylines = _get(opts.hash, 'bylines', []),
    authors = bylines.map((author) => _isObject(author) ? author.text : author);

  if (authors.length === 1) {
    return '<span>' + authors[0] + '</span>';
  } else if (authors.length === 2) {
    return '<span>' + authors[0] + '</span><span class="and"> and </span><span>' + authors[1] + '</span>';
  } else {
    return authors.map((author, index) => index < authors.length - 1
      ? `<span>${author}, </span>`
      : `<span class="and">and </span><span>${author}</span>`
    ).join('');
  }
}

module.exports = formatSimpleByline;
