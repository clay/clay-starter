'use strict';

const rest = require('./rest'),
  querystring = require('query-string'),
  _get = require('lodash/get'),
  moment = require('moment'),
  YT_API = 'https://www.googleapis.com/youtube/v3',
  log = require('./log').setup({ file: __filename });

/**
 * Get duration as ISO 8601 and convert it to seconds
 * @param {string} duration - The duration as ISO 8601
 * @return {number} @duration in seconds
 */
function getDurationInSeconds(duration) {
  return moment.duration(duration, moment.ISO_8601).asSeconds();
}

/**
 * Get youtube video details
 * @param {string} videoId - Youtube videoId
 * @return {Object} - The video details
 */
function getVideoDetails(videoId) {
  const videoSearchUrl = `${YT_API}/videos`,
    qs = querystring.stringify({
      part: 'snippet,contentDetails',
      id: videoId,
      key: process.env.YOUTUBE_API_KEY
    });

  return rest.get(`${videoSearchUrl}?${qs}`)
    .then(res => Object.assign(
      _get(res, 'items[0].snippet', {}),
      { duration: getDurationInSeconds(_get(res, 'items[0].contentDetails.duration', 0)) }
    ))
    .catch(err => log('error', `Error fetching video details for video id ${videoId}: ${err.message}`));
}

module.exports.getVideoDetails = getVideoDetails;
