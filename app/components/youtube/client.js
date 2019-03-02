'use strict';

const youtubeVideoPlayer = require('../../services/universal/youtube-video-player'),
  $visibility = require('../../services/client/visibility'),
  $gtm = require('../../services/client/gtm');

module.exports = (el) => {
  var autoplay = el.getAttribute('data-autoplay-video') === 'true',
    videoConfig = {
      videoContainerId: el.getAttribute('data-element-id').trim(),
      videoId: el.getAttribute('data-video-id').trim(),
      // player variables and settings
      playerParams: {
        loop: 1,
        listType: 'playlist',
        list: el.getAttribute('data-playlist').trim(),
        autoplay: autoplay ? 1 : 0,
        controls: 1,
        enablejsapi: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        wmode: 'transparent'
      },
      customParams: {
        autoPlayNextVideo: el.getAttribute('data-autoplay-next-video').trim(),
        trackVideoType: el.getAttribute('data-track-video-type').trim(),
        customPlayer: el.getAttribute('data-custom-play').trim(),
        templateid: el.getAttribute('data-element-id').trim(),
        muted: autoplay // always mute autplaying videos
      }
    },
    analytics = getAnalyticsCustomDimensions(el),
    visible;

  if (videoConfig.customParams.trackVideoType === 'Sponsored') {
    videoConfig.playerParams.list = '';
  }

  visible = new $visibility.Visible(el, { preloadThreshold: 800 });

  // when the video player element enters the viewport, load the video(s)
  if (visible.preload && $visibility.isElementNotHidden(el)) {
    // if the YouTube api is ready the videos(s) can be loaded
    if (window.nymYTApiReady === true) {
      youtubeVideoPlayer.init(videoConfig);
    } else {
      // wait and listen for the YouTube api to be ready before loading the video(s)
      document.addEventListener('nym-youtube-event:youtube-api-ready', function () {
        youtubeVideoPlayer.init(videoConfig);
      });
    }
  } else {
    visible.on('preload', function () {
      youtubeVideoPlayer.init(videoConfig);
    });
  }

  /**
   * Player ready event
   * this fires when the player is initially loaded and pushes variables specific to the
   * component into the data layer. Information about the video itself is captured from the
   * native gtm.video trigger on play and finish
   */
  document.addEventListener('player-ready-' + videoConfig.videoContainerId, function () {
    $gtm.reportNow(Object.assign({
      youtubeAction: 'player ready'
    }, analytics));
  });

  /**
   * Player start event
   *
   * we don't need to send an event here, updating the video id for posterity
   * also might be nice to send an event if we see the video id changed?
   */
  document.addEventListener('player-start-' + videoConfig.videoContainerId, function (evt) {
    var hasChanged = el.getAttribute('data-video-id') !== evt.player.videoId;

    if (hasChanged) {
      updateElementAttributes(el, evt.player);
      // this will tell the gtm.video trigger to stop ignoring gtm.video events
      // in the case that an external video was played initially then switched to
      // an internal playlist
      $gtm.reportNow(Object.assign({
        event: 'youtubeVideoReset',
        youtubeVideoId: evt.player.videoId,
        youtubeChannelName: 'New York Magazine'
      }));
    }
  });
};

/**
 * Updates Element attributes
 * @param {Object} el - DOM node element
 * @param {Object} config - Attributes values from player
 */
function updateElementAttributes(el, config) {
  el.setAttribute('data-video-id', config.videoId);
}

/**
 * Gets analytics custom dimensions for video player
 * @param {Object} el
 * @returns {Object} analytics
 */
function getAnalyticsCustomDimensions(el) {
  return {
    event: 'youtubeVideo',
    youtubeVideoId: el.getAttribute('data-video-id'),
    youtubeVideoLocation: el.getAttribute('data-track-video-location'),
    youtubeVideoType: el.getAttribute('data-track-video-type'),
    youtubeVideoTitle: el.getAttribute('data-track-video-title'),
    youtubeChannelName: el.getAttribute('data-track-channel-name'),
    youtubeVideoDuration: el.getAttribute('data-track-video-duration')
  };
}

// module.exports = (el) =>{console.log(el);};
