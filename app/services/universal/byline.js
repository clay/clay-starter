'use strict';

const _get = require('lodash/get'),
  _join = require('lodash/join'),
  _map = require('lodash/map'),
  _isObject = require('lodash/isObject');

/**
 * Comma separate a list of author strings
 * or simple-list objects
 *
 * @param  {String[]} opts
 * @return {String}
 */
function formatSimpleByline(opts = {}) {
  const bylines = _get(opts.hash, 'bylines', []),
    authors = _map(bylines, author => (_isObject(author) ? author.text : author));

  if (authors.length === 1) {
    return `<span>${authors[0]}</span>`;
  } else if (authors.length === 2) {
    return `<span>${authors[0]}</span><span class="and"> and </span><span>${authors[1]}</span>`;
  } else {
    return _join(
      _map(authors, (author, idx) =>
        idx < authors.length - 1
          ? `<span>${author}, </span>`
          : '<span class="and">and </span><span>' + author + '</span>'
      ),
      ''
    );
  }
}

module.exports = formatSimpleByline;
