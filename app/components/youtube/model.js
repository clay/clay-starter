'use strict';

const _get = require('lodash/get'),
  { getVideoDetails } = require('../../services/universal/youtube'),
  defaultPlayerBorderTopCTA = 'Watch';

/**
 * Override various settings by type of video
 * @param {Object} data
 */
function updateSettingsByType(data) {
  switch (data.videoType) {
    case 'related':
      // By default, display borders and CTA when `related` type is first selected, afterwards accept user's selection
      data.playerBorderTopCTA = !data.previousTypeRelated && !data.playerBorderTopCTA ? defaultPlayerBorderTopCTA : data.playerBorderTopCTA;
      data.playerBorderTop = !data.previousTypeRelated ? true : data.playerBorderTop;
      data.playerBorderBottom = !data.previousTypeRelated ? true : data.playerBorderBottom;
      data.previousTypeRelated = true;
      break;
    case 'sponsored':
      data.autoPlay = false;
      data.autoPlayNextVideo = false;
      break;
    default:
      // Toggle borders off if user previously selected `related` type. `sponsored` and `editorial` types share defaults
      data.playerBorderTop = data.previousTypeRelated ? false : data.playerBorderTop;
      data.playerBorderBottom = data.previousTypeRelated ? false : data.playerBorderBottom;
      data.previousTypeRelated = false;
  }
}

function clearVideoId(data) {
  data.videoId = (data.videoId || '').split('&')[0];

  return data;
}

function setVideoDetails(data, videoDetails) {
  if (!videoDetails.title) {
    data.videoValid = false;

    return data;
  }

  const maxResThumb = _get(videoDetails, 'thumbnails.maxres.url');

  data.videoValid = true;
  data.channelName = videoDetails.channelTitle;
  data.videoTitle = videoDetails.title;
  data.videoThumbnail = maxResThumb ? maxResThumb : _get(videoDetails, 'thumbnails.high.url'); // get the maxres if available, otherwise get the high res which we know will be there
  data.videoDuration = videoDetails.duration;

  return data;
}

module.exports.save = (uri, data) => {
  clearVideoId(data);
  updateSettingsByType(data);

  if (data.videoId) {
    return getVideoDetails(data.videoId)
      .then(videoDetails => setVideoDetails(data, videoDetails));
  }

  data.videoValid = true; // technically not an invalid video because no videoId so we don't want to show an error message in edit mode

  return data;
};

