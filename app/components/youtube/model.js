'use strict';
const _get = require('lodash/get'),
   { getVideoDetails } = require('../../services/universal/youtube'),
  defaultPlayerBorderTopCTA = 'Watch';

/**
 * Override various settings by type of video
 * @param {object} data
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
  var maxResThumb;

  if (!videoDetails.title) {
    data.videoValid = false;

    return data;
  }

  maxResThumb = _get(videoDetails, 'thumbnails.maxres.url');

  data.videoValid = true;
  data.channelName = videoDetails.channelTitle;
  data.videoTitle = videoDetails.title;
  data.videoThumbnail = maxResThumb ? maxResThumb : _get(videoDetails, 'thumbnails.high.url'); // get the maxres if available, otherwise get the high res which we know will be there
  data.videoDuration = videoDetails.duration;

  return data;
}

function getDefaultPlaylistBySite(data, locals) {
  switch (locals.site.slug) {
    case 'wwwthecut':
      return 'PL4B448958847DA6FB';
      break;
    case 'vulture':
      return 'PLZQfnFyelTBOQ15kmHSgEbdjzLMWzZpL7';
      break;
    case 'grubstreet':
      return 'PLtmzdzCeRsyG_td56GV9JtS3yif177lfK';
      break;
    case 'di':
      return 'PLtmzdzCeRsyHbGTxOX4BZvSgXBh20n-_4';
      break;
    case 'selectall':
      return 'PLtmzdzCeRsyHh67c-VlEj8Nqpj5nL8pf6';
      break;
    default:
      return 'PLtmzdzCeRsyFQ64kOTZS7eBLQ1fH2feu7'; // if its a site without a default playlist, use the 'latest from new york' playlist
      break;
  }
}

module.exports.save = (uri, data, locals) => {
  clearVideoId(data);
  updateSettingsByType(data);

  if (data.videoId && !data.videoPlaylist) {
    data.videoPlaylist = getDefaultPlaylistBySite(data, locals);
  }

  //   if (data.videoId) {
  //     return getVideoDetails(data.videoId)
  //       .then(videoDetails => setVideoDetails(data, videoDetails));
  //   }

  data.videoValid = true; // technically not an invalid video because no videoId so we don't want to show an error message in edit mode

  return data;
};

