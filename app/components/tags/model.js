'use strict';
const _map = require('lodash/map'),
  _assign = require('lodash/assign'),
  _set = require('lodash/set'),
  _includes = require('lodash/includes'),
  { removeNonAlphanumericCharacters } = require('../../services/universal/sanitize'),
  // invisible tags will be rendered to the page but never visible outside of edit mode
  invisibleTags = [];

/**
 * Removes all non alphanumeric characters from the tags
 * @param {array} items
 * @returns {array}
 */
function normalizeTags(items = []) {
  return items.map(({ text }) => removeNonAlphanumericCharacters(text)).filter(Boolean);
}

/**
 * make sure all tags are lowercase and have trimmed whitespace
 * @param  {array} items
 * @return {array}
 */
function clean(items) {
  return _map(items || [], function(item) {
    return _assign({}, item, { text: item.text.toLowerCase().trim() });
  });
}

/**
 * set an 'invisible' boolean on tags, if they're in the list above
 * @param {array} items
 * @return {array}
 */
function setInvisible(items) {
  return _map(items || [], function(item) {
    return _set(item, 'invisible', _includes(invisibleTags, item.text));
  });
}

module.exports.save = function(uri, data) {
  let { items } = data;

  items = clean(items); // first, make sure everything is lowercase and has trimmed whitespace
  data.normalizedTags = normalizeTags(items);
  items = setInvisible(items); // then figure out which tags should be invisible
  data.items = items;

  return data;
};
