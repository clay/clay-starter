'use strict';

const sharePopUp = require('../../services/client/sharePopup');

module.exports = () => {
  let canonicalEl = document.querySelector('link[rel="canonical"]'),
    canonicalURL = canonicalEl.getAttribute('href'),
    shareURL = canonicalURL.trim() || document.location.href;

  [...document.querySelectorAll('header.header .share-link')].forEach((shareLink) => {
    new sharePopUp(shareLink, shareURL);
  });
};
