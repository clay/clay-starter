'use strict';

var moment = require('moment');

/**
 * Format date <10-07-2017> to <October 7>
 * or <10-07-2017 && 11-08-2017> to <October 7-November 8, 2017>
 *
 * @param {string} dateFrom - Beginning date.
 * @param {string} dateTo - Ending date.
 * @param {string} [format] - Format for parsing date // Full Month Name, Day number, Full Year.
 * @returns {string} formatted Date.
 *
 * Note (c.g. 2017-11-22): Since we're not passing the hour moment
 * is returning a day less so for avoiding this we need to set
 * the hours in this case 24.
 */
function formatDateRange(dateFrom = '', dateTo = '', format = 'MMMM D, YYYY') {
  if (dateTo && dateFrom) {
    return `${moment(new Date(dateFrom).setHours(24)).format('MMMM D')}-${moment(new Date(dateTo).setHours(24)).format(format)}`;
  } else if (!dateTo && dateFrom) {
    return `${moment(new Date(dateFrom).setHours(24)).format(format)}`;
  } else {
    return '';
  }
}

function secondsToISO(seconds) {
  return moment.duration(seconds, 'seconds').toISOString();
}

/**
 * Returns true if article was published within the past 24 hrs.
 * @function
 * @param {Object} date - The date the article was published.
 * @returns {boolean}
 */
function isPublished24HrsAgo(date) {
  let pubWithin24Hrs = false,
	 articleDate = moment(new Date(date)).valueOf(),
	 now = moment().valueOf();

  if (now - articleDate <= 24 * 60 * 60 * 1000 ) {
    pubWithin24Hrs = true;
  }
  return pubWithin24Hrs;
}

/**
 * Returns "X hours ago" timestamp of when article was published
 * @function
 * @param {Object} date - The date the article was published.
 * @return {string}
 */
function hrsOnlyTimestamp(date) {
  return moment().format('H') - moment(date).format('H') + ' hours ago';
}

module.exports.formatDateRange = formatDateRange;
module.exports.secondsToISO = secondsToISO;
module.exports.isPublished24HrsAgo = isPublished24HrsAgo;
module.exports.hrsOnlyTimestamp = hrsOnlyTimestamp;
