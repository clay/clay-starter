'use strict';

const $window = typeof window !== 'undefined' ? window : undefined;

class Popup {
  constructor() {
    /**
     * returns an object of new window options
     * @param {{ url: String, name: string }} opts - Object containing
     * @param {Object} dimensions - An object of new window options, including dimensions & position
     * @returns {Object}
     */
    this.params = (opts, dimensions) => {
      if (opts.url) {
        this.address = opts.url;
      }

      if (opts.name) {
        this.name = opts.name;
      }

      this.features = 'width=' + (dimensions.width || 0) + ',height=' + (dimensions.height || 0) + ',top=' + (dimensions.top || 0) + ',left=' + (dimensions.left || 0);

      return this;
    };

    /**
      * returns an object of screen dimensions
      * @returns {{ dualScreenLeft: number, dualScreenTop: number, width: number, height: number }}
    */
    this.getScreenDimensions = () => {
      const usesScreenForDimensions = $window.hasOwnProperty('screen') && $window.screen.hasOwnProperty('screenTop');
      let dualScreenLeft,
        dualScreenTop;

      if (usesScreenForDimensions) {
        dualScreenLeft = $window.screen.left;
        dualScreenTop = $window.screen.top;
      } else {
        dualScreenLeft = $window.screenLeft;
        dualScreenTop = $window.screenTop;
      }

      return {
        dualScreenLeft: dualScreenLeft || 0,
        dualScreenTop: dualScreenTop || 0,
        width: $window.innerWidth || $window.screen.width,
        height: $window.innerHeight || $window.screen.height
      };
    };

    /**
     * returns an object of numbers used for positioning a new window
     * @param {Number} newWidth - the current window's width
     * @param {Number} newHeight - the current window's height
     * @returns {Object}
     */
    this.position = (newWidth, newHeight) => {
      let dimensions = this.getScreenDimensions();

      this.left = Math.floor(Math.max(dimensions.width / 2 - newWidth / 2 + dimensions.dualScreenLeft, 0));
      this.top = Math.floor(Math.max(dimensions.height / 2 - newHeight / 2 + dimensions.dualScreenTop, 0));

      return this;
    };
  }
}

module.exports = new Popup;
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
