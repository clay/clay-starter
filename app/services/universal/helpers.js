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

module.exports = {
  incIndex: incrementIndex,
  byline: require('./byline'),
  secondsToISO: formatTime.secondsToISO,
  formatDateRange: formatTime.formatDateRange,
  isPublished24HrsAgo: formatTime.isPublished24HrsAgo,
  hrsOnlyTimestamp: formatTime.hrsOnlyTimestamp,
  articleTimestamp: require('./article-timestamp'),
  truncateText: truncate,
  calloutType: require('./callout')
};
