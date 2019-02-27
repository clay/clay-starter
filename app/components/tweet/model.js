'use strict';

const { get } = require('../../services/universal/helpers'),
  rest = require('../../services/universal/rest'),
  promises = require('../../services/universal/promises'),
  utils = require('../../services/universal/utils'),
  TWITTER_ENDPOINT = 'https://api.twitter.com/1/statuses/oembed.json',
  TWEET_URL_RE = /(https?:\/\/twitter\.com\/\w+?\/status(?:es)?\/(\d+))\/?/;

function getRequestUrl(data) {
  const hideMedia = !data.showMedia ? '&hide_media=true' : '',
    hideThread = !data.showThread ? '&hide_thread=true' : '';

  return `${TWITTER_ENDPOINT}?url=${encodeURI(data.url)}&omit_script=true${hideThread}${hideMedia}`;
}

/**
 * Gets Twitter Embeds data
 * @param {string} url
 * @param {object} data
 * @return {object}
 */
function makeTweetEmbedsRequest(url, data) {
  return rest.getJSONP(url)
    .then((res) => {
      // if twitter gives us an error, make the tweet invalid
      if (get(res, 'errors.length')) {
        data.tweetValid = false;
      }

      // store tweet oembed html
      data.html = res.html;

      // update component instance with new html
      return data;
    })
    .catch(() => {
      if (utils.isFieldEmpty(data.html)) {
        data.tweetValid = false;
      }

      // we have html for this, so it means the tweet has most likely been deleted. display it with the fallback styles
      return data;
    });
}

module.exports.render = (ref, data) => {
  const [, , tweetId] = TWEET_URL_RE.exec(data.url) || [null, '', null];

  data.tweetId = tweetId;

  return data;
};

module.exports.save = (ref, data) => {
  if (utils.isFieldEmpty(data.url)) {
    delete data.html;

    return data;
  }

  // first, wrangle the url
  const [, url] = TWEET_URL_RE.exec(data.url) || [null, ''];

  data.url = url;
  data.tweetValid = true;

  // note: we're using the un-authenticated api endpoint. don't abuse this
  return promises.timeout(makeTweetEmbedsRequest(getRequestUrl(data), data), 1500)
    .catch(() => {
      data.tweetValid = false;

      return data;
    });
};
