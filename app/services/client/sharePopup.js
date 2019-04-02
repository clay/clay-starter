'use strict';

const popup = require('./popup');

class sharePopUp {
  /**
   * Create a Popup for share services
   * @param {Node} shareLink - html anchor tag
   * @param {string} shareURL - url of page to be shared
   */
  constructor(shareLink, shareURL) {
    this.shareLink = shareLink;
    this.shareURL = shareURL;
    this.shareService = this.shareLink.getAttribute('data-shareService') || null;
    this.shareTitle = this.shareLink.getAttribute('title') || 'Clay Starter';

    this.setDimensions();
    this.addShareURL();
    this.addClickHandler();
  }

  addShareURL() {
    switch (this.shareService) {
      case 'twitter':
        this.shareLink.href = `https://twitter.com/share?text=${encodeURIComponent(
          this.shareTitle
        )}&url='${this.shareURL}?utm_source=tw&utm_medium=s3&utm_campaign=sharebutton-t`;
        break;
      case 'facebook':
        this.shareLink.href = `http://www.facebook.com/sharer/sharer.php?u=${
          this.shareURL
        }?utm_source=fb&utm_medium=s3&utm_campaign=sharebutton-t`;
        break;
      default:
    }
  }

  addClickHandler() {
    this.shareLink.addEventListener('click', this.handleClick.bind(this));
  }

  handleClick(e) {
    e.preventDefault();

    const dimensions = this.popupDimensions[this.shareService] || this.popupDimensions.default;

    popup.openPopUp(this.shareLink.href, dimensions);
  }

  setDimensions() {
    this.popupDimensions = {
      default: {
        w: 520,
        h: 304
      },
      facebook: {
        w: 520,
        h: 304
      },
      twitter: {
        w: 550,
        h: 572
      }
    };
  }
}

module.exports = sharePopUp;
