'use strict';

class service {
  getWindowSize() {
    const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left,
      dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top,
      width = window.innerWidth || document.documentElement.clientWidth || screen.width,
      height = window.innerHeight || document.documentElement.clientHeight || screen.height;

    return { dualScreenLeft, dualScreenTop, height, width };
  }

  getCenterPosition(windowSize, dimensions) {
    const left = windowSize.width / 2 - dimensions.w / 2 + windowSize.dualScreenLeft,
      top = windowSize.height / 2 - dimensions.h / 2 + windowSize.dualScreenTop;

    return { left, top };
  }

  /**
   * openPopup Window
   * @param {string} url - address of the popup page
   * @param {object} dimensions { w: width of popup, h: height of popup}
   */
  openPopUp(url, dimensions) {
    const popupPosition = this.getCenterPosition(this.getWindowSize(), dimensions),
      params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
width=${dimensions.w},height=${dimensions.h},left=${popupPosition.left},top=${popupPosition.top}`;

    window.open(url, 'popup', params);
  }
}

module.exports = new service;
