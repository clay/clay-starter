
'use strict';

const _find = require('lodash/find'),
  _includes = require('lodash/includes'),
  _get = require('lodash/get');
var $window = typeof window !== 'undefined' ? window : undefined;

class service {
  constructor() {

    var popupService = this;

    this.popupClasses = [
    // classes we should open the popup for
    // don't open popups for email and print
    // careful of changes b/c these values go into analytics, e.g. $gtm
      'facebook',
      'twitter',
      'linkedin',
      'gplus',
      'pinterest',
      'tumblr'
    ];

    // dimensions of our various social media popups
    this.popupDimensions = {
      default: {
        w: 520,
        h: 304
      },
      facebook: {
        w: 520,
        h: 304
      },
      gplus: {
        w: 520,
        h: 485
      },
      linkedin: {
        w: 520,
        h: 450
      },
      pinterest: {
        w: 1015,
        h: 630
      },
      tumblr: {
        w: 520,
        h: 312
      },
      twitter: {
        w: 550,
        h: 572
      }
    };

    /**
     * get supported popup class
     * @param {array} classList
     * @returns {string|undefined}
     */
    this.getPopupClass = function (classList) {
      return _find(popupService.popupClasses, function (supportedClass) {
        return _includes(classList, supportedClass);
      });
    };

    /**
     * returns an object of new window options
     * @param {{ url: String, name: String }} opts - Object containing
     * @param {Object} dimensions - An object of new window options, including dimensions & position
     * @returns {Object}
     */
    this.params = function (opts, dimensions) {
      if (opts.url) {
        this.address = opts.url;
      }

      if (opts.name) {
        this.name = opts.name;
      }

      this.features = 'width=' + (dimensions.w || 0) + ',height=' + (dimensions.h || 0) + ',top=' + (dimensions.top || 0) + ',left=' + (dimensions.left || 0);

      return this;
    };

    /**
      * returns an object of screen dimensions
      * @returns {{ dualScreenLeft: Number, dualScreenTop: Number, width: Number, height: Number }}
    */
    this.getScreenDimensions = function () {
      var usesScreenForDimensions = $window.hasOwnProperty('screen') && $window.screen.hasOwnProperty('screenTop'),
        dualScreenLeft,
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
    this.position = function (newWidth, newHeight) {
      var dimensions = popupService.getScreenDimensions();

      this.left = Math.floor(Math.max(dimensions.width / 2 - newWidth / 2 + dimensions.dualScreenLeft, 0));
      this.top = Math.floor(Math.max(dimensions.height / 2 - newHeight / 2 + dimensions.dualScreenTop, 0));

      return this;
    };

    /**
     * create a social media popup!
     * @param {string} popupClass
     * @param {string} handle
     * @param {string} url
     */
    this.popWindow = function (popupClass, handle, url) {
      var Position = popupService.position,
        Params = popupService.params,
        opts = {},
        dims = {},
        networkLabelMap = {
          facebook: 'Facebook',
          twitter: 'Twitter',
          pinterest: 'Pinterest',
          gplus: 'Google+'
        },
        args, features;

      opts.url = url;
      opts.name = 'Follow ' + handle + ' on ' + networkLabelMap[popupClass];
      dims.w = _get(popupService.popupDimensions, popupClass + '.w');
      dims.h = _get(popupService.popupDimensions, popupClass + '.h');
      features = new Position(dims.w, dims.h);
      dims.left = features.left;
      dims.top = features.top;
      args = new Params(opts, dims);
      window.open(args.address, args.name, args.features);
    };
  }

  stubFakeWindow(fakeWindow) {
    $window = typeof window !== 'undefined' ? window : fakeWindow;
  }
}

module.exports = new service;
