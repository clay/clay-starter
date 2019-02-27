'use strict';

const formatTime = require('./format-time'),
  truncate = require('./truncate');

/**
 * Given a number or a string of a number, increment
 * the value and return it.
 *
 * @param {String|Number} index
 * @param {Number} inc
 * @returns {Number}
 */
function incrementIndex(index, inc = 1) {
  if (typeof index !== 'number') index = parseInt(index, 10);

  return index + inc;
}

/**
 * Gets the property value at path of object. If the resolved value is undefined the defaultValue is used,
 * If no defaultValue is specified return undefined
 * @param {object} obj The object to query.
 * @param {string} path The path of the property to get.
 * @param {undefined|defaultValue} defaultValue The value returned if the resolved value is undefined
 * @return {defaultValue|undefined} Returns the resolved value.
 */
function get(obj, path, defaultValue) {
  return path.split('.').reduce((objValue, pathValue) => objValue && objValue[pathValue] ? objValue[pathValue] : defaultValue || undefined, obj );
}

module.exports = {
  incIndex: incrementIndex,
  byline: require('./byline'),
  secondsToISO: formatTime.secondsToISO,
  formatDateRange: formatTime.formatDateRange,
  isPublished24HrsAgo: formatTime.isPublished24HrsAgo,
  hrsOnlyTimestamp: formatTime.hrsOnlyTimestamp,
  articleTimestamp: require('./article-timestamp'),
  truncateText: truncate,
  calloutType: require('./callout'),
  get
};
