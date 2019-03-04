'use strict';

const rest = require('./rest'),
  querystring = require('query-string'),
  _get = require('lodash/get'),
  moment = require('moment'),
  YT_API = 'https://www.googleapis.com/youtube/v3',
  log = require('./log').setup({ file: __filename });


function getDurationInSeconds(duration) {
  return moment.duration(duration, moment.ISO_8601).asSeconds();
}

function getVideoDetails(videoId) {
  debugger;
  const videoSearchUrl = `${YT_API}/videos`,
    qs = querystring.stringify({
      part: 'snippet,contentDetails',
      id: videoId,
      key: 'AIzaSyCtD1a3SWW3QFzyfkLi0NpwvHL9InosQi8'
    });

  // key: process.env.YOUTUBE_API_KEY

  console.log(qs);

  return rest.get(`${videoSearchUrl}?${qs}`)
    .then(res => Object.assign(
      _get(res, 'items[0].snippet', {}),
      { duration: getDurationInSeconds(_get(res, 'items[0].contentDetails.duration', 0)) }
    ))
    .catch(err => log('error', `Error fetching video details for video id ${videoId}: ${err.message}`));
}

module.exports.getVideoDetails = getVideoDetails;
