'use strict';

const youtubeVideoPlayer = require('../../services/universal/youtube-video-player'),
  { Visible, isElementNotHidden } = require('../../services/client/visibility');

module.exports = (el) => {
  const autoplay = el.getAttribute('data-autoplay-video') === 'true',
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
    visible = new Visible(el, { preloadThreshold: 800 });

  if (videoConfig.customParams.trackVideoType === 'Sponsored') {
    videoConfig.playerParams.list = '';
  }

  // when the video player element enters the viewport, load the video(s)
  if (visible.preload && isElementNotHidden(el)) {
    // if the YouTube api is ready the videos(s) can be loaded
    if (window.youtubeApiReady === true) {
      youtubeVideoPlayer.init(videoConfig);
    } else {
      // wait and listen for the YouTube api to be ready before loading the video(s)
      document.addEventListener('youtube-event:youtube-api-ready', function () {
        youtubeVideoPlayer.init(videoConfig);
      });
    }
  } else {
    visible.on('preload', function () {
      youtubeVideoPlayer.init(videoConfig);
    });
  }

  /**
   * Player start event
   * we don't need to send an event here, updating the video id for posterity
   */
  document.addEventListener('player-start-' + videoConfig.videoContainerId, function (evt) {
    const hasChanged = el.getAttribute('data-video-id') !== evt.player.videoId;

    if (hasChanged) {
      updateElementAttributes(el, evt.player);
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
