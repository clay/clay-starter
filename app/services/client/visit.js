'use strict';
const _reduce = require('lodash/reduce'),
  _get = require('lodash/get'),
  _includes = require('lodash/includes'),
  _assign = require('lodash/assign'),
  _clone = require('lodash/clone'),
  _remove = require('lodash/remove'),
  Fingerprint2 = require('fingerprintjs2'),
  cookie = require('js-cookie');

var localStorage = window.localStorage,
  uriAttr = 'data-uri',
  visitCountKey = 'visitServiceCount', // set in the-factory
  previousActionTimestampKey = 'visitServicePreviousTimestamp', // set in the-factory
  firstVisitTimestampKey = 'visitServiceFirstVisitTimestamp',
  visitStartTimestampKey = 'visitServiceVisitStartTimestamp',
  initialReferrerKey = 'visitServiceInitialRefferer', // new to clay
  clientIdCookieKey = 'nyma', // set on all non-clay pages
  visitDatesKey = 'visitDates',
  maxVisitDuration = 1000 * 60 * 60 * 24, // a visit can not last more than 24 hours
  sessionTTL = 1000 * 60 * 30, // keep session open for 30 minutes after last event
  visitDatesLimit = 30, // number of days over which to track dates of visits
  publicState = {},
  publicStateIsReady = false,
  onceReadyQueue = [],
  state = Object.create(Object.prototype, {
    /**
     * runs all callbacks in the queue with the current value of clientId
     * @private
     */
    _processQ: {
      value: function () {
        var qClone = this._q.slice(0),
          l = qClone.length,
          i;

        this._q = [];
        for (i = 0; i < l; i++) {
          qClone[i].call(null, this._clientId);
        }
      }
    },
    _q: {
      writable: true,
      value: []
    },
    _clientId: {
      writable: true,
      value: null
    },
    clientId: {
      /**
       * attempts to get clientId as stored in private `_clientId`
       * @returns {state._clientId}
       */
      get: function () {
        return this._clientId;
      },
      /**
       * sets the clientId in state and cookie, then processes queue of callbacks
       * @param {string} val
       */
      set: function (val) {
        if (val) {
          this._clientId = val;
          cookie.set(clientIdCookieKey, val, { expires: 365 * 5 }); // cookie expires after 5 years
          this._processQ();
        }
      }
    },
    /**
     * the clientId may need to be retrieved through an async process
     * this method will call the callback once the clientId is ready
     * @param {Function} callback
     */
    onceClientIdIsReady: {
      value: function (callback) {
        this._clientId ? callback.call(null, this._clientId) : this._q.push(callback);
      }
    },
    isNewVisit: {
      writable: true,
      value: false
    }
  });

/**
 * @param {string|number} [val]
 * @returns {number} defaults to zero if number can not be parsed
 */
function toNumber(val) {
  return parseInt(val, 10) || 0; // defaults to zero
}
/**
 *
 * @param {string} key
 * @returns {number}
 */
function getNumberFromLocalStorage(key) {
  return toNumber(localStorage.getItem(key)); // defaults to zero
}

/**
 * get visit count from localStorage
 * @returns {number}
 */
function getVisitCount() {
  return getNumberFromLocalStorage(visitCountKey);
}

/**
 * get visit count from localStorage
 * @returns {number}
 */
function getFirstVisitTimestamp() {
  return getNumberFromLocalStorage(firstVisitTimestampKey);
}

function incrementVisitCount() {
  try {
    localStorage.setItem(visitCountKey, getVisitCount() + 1);
  } catch (e) {
    // the browser failed to setItem, likely due to Private Browsing mode. We don't need to take any action
  }
}

/**
 * parse the clientId which contains the first visit timestamp
 * @param {string} clientId
 * @returns {number}
 */
function clientIdToFirstVisitTimestamp(clientId) {
  return toNumber(clientId.substr(clientId.indexOf('.') + 1)); // assumes that timestamp is at end of clientId
}

/**
 *
 * @param {string} clientId
 * @returns {number}
 */
function ensureFirstVisitTimestamp(clientId) {
  var firstVisitTimestamp = getFirstVisitTimestamp();

  if (!firstVisitTimestamp) {
    firstVisitTimestamp = clientIdToFirstVisitTimestamp(clientId); // could be 0 if clientId is malformed
    try {
      localStorage.setItem(firstVisitTimestampKey, firstVisitTimestamp);
    } catch (e) {
      // the browser failed to setItem, likely due to Private Browsing mode. We don't need to take any action
    }
  }
  return firstVisitTimestamp;
}

/**
 *
 * @param {number} timestamp
 */
function setPreviousActionTimestamp(timestamp) {
  try {
    localStorage.setItem(previousActionTimestampKey, timestamp);
  } catch (e) {
    // the browser failed to setItem, likely due to Private Browsing mode. We don't need to take any action
  }
}

/**
 * @param {number} timestamp
 */
function setVisitStartTimestamp(timestamp) {
  try {
    localStorage.setItem(visitStartTimestampKey, timestamp);
  } catch (e) {
    // the browser failed to setItem, likely due to Private Browsing mode. We don't need to take any action
  }
}

/**
 * Checks if more than the `sessionTTL` has elapsed since the previous action
 * @param {number} currentTimestamp
 * @returns {boolean}
 */
function isNewVisit(currentTimestamp) {
  var sessionExpired = currentTimestamp - sessionTTL > getNumberFromLocalStorage(previousActionTimestampKey),
    visitDurationExpired = currentTimestamp - maxVisitDuration > getNumberFromLocalStorage(visitStartTimestampKey);

  return sessionExpired || visitDurationExpired;
}

/**
 * @param {number} currentTimestamp
 */
function updateNewVisitState(currentTimestamp) {
  state.isNewVisit = isNewVisit(currentTimestamp);
}

/**
 * Extend visit whenever an "action" is taken to keep the session alive
 * This should be triggered when any user action is detected
 * Updates the previous action timestamp if the visit session has not timed out
 */
function extendVisit() {
  var currentTimestamp = Date.now(),
    currentVisitIsAlive = !isNewVisit(currentTimestamp);

  if (currentVisitIsAlive) {
    // update timestamp only if session still alive
    setPreviousActionTimestamp(currentTimestamp);
  }
  // todo: in the future we may want to add a "visit" event that other components could listen for
  // for simplicity we are only triggering a new visit/page view when a page is loaded
}

/**
 * generates a clientId based on fingerprint and timestamp and stores in `state` object
 * @param {number} currentTimestamp
 */
function createClientId(currentTimestamp) {
  (new Fingerprint2({ // Fingerprint2 npm module added with gulp
    excludeJsFonts: true,
    excludeFlashFonts: true,
    excludeCanvas: true,
    excludeWebGL: true,
    excludePixelRatio: true
  })).get(function (fingerprint) {
    state.clientId = fingerprint + '.' + currentTimestamp;
  });
}

/**
 * gets clientId from cookie or creates a new one
 * @param {number} currentTimestamp
 */
function ensureClientId(currentTimestamp) {
  state.clientId = cookie.get(clientIdCookieKey);
  if (!state.clientId) {
    createClientId(currentTimestamp);
  }
}

/**
 *
 * @returns {string|null}
 */
function getPageUri() {
  var el = document.querySelector('[' + uriAttr + '*="/_pages/"]');

  return el && el.getAttribute(uriAttr);
}

/**
 * returns an object with key value pairs parsed from query string
 * @param {array} keys
 * @returns {object}
 */
function getQueryParamsObject(keys) {
  keys = Array.isArray(keys) ? keys : [];

  return _reduce(
    _get(window, 'location.search', '').substr(1).split('&'),
    function (obj, str) {
      var arr = str.split('='),
        key = arr[0],
        val = arr[1];

      if (val && _includes(keys, key)) {
        obj[key] = decodeURIComponent(val);
      }
      return obj;
    },
    {}
  );
}


/**
 * returns an object from utm query params
 * @returns {object}
 */
function getUtmParams() {
  var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

  return getQueryParamsObject(keys);
}

/**
 * derived from mixpanel so that our stats are consistent with page view props
 * source: https://github.com/mixpanel/mixpanel-js/blob/f8fe5b29ea90ab89df21e8db53c5fbaf0ebf8174/src/utils.js#L1376
 * @param {string} [userAgent]
 * @param {string} [vendor]
 * @param {object} [opera]
 * @returns {string}
 */
function getBrowserName(userAgent, vendor, opera) {
  // disabling linting to keep code in-line with mixpanel as closely as possible
  /* eslint complexity: [2, 20] */
  // order matters
  if (opera || _includes(userAgent, ' OPR/')) {
    if (_includes(userAgent, 'Mini')) {
      return 'Opera Mini';
    }
    return 'Opera';
  } else if (/(BlackBerry|PlayBook|BB10)/i.test(userAgent)) {
    return 'BlackBerry';
  } else if (_includes(userAgent, 'IEMobile') || _includes(userAgent, 'WPDesktop')) {
    return 'Internet Explorer Mobile';
  } else if (_includes(userAgent, 'Edge')) {
    return 'Microsoft Edge';
  } else if (_includes(userAgent, 'FBIOS')) {
    return 'Facebook Mobile';
  } else if (_includes(userAgent, 'Chrome')) {
    return 'Chrome';
  } else if (_includes(userAgent, 'CriOS')) {
    return 'Chrome iOS';
  } else if (_includes(userAgent, 'FxiOS')) {
    return 'Firefox iOS';
  } else if (_includes(vendor, 'Apple')) {
    if (_includes(userAgent, 'Mobile')) {
      return 'Mobile Safari';
    }
    return 'Safari';
  } else if (_includes(userAgent, 'Android')) {
    return 'Android Mobile';
  } else if (_includes(userAgent, 'Konqueror')) {
    return 'Konqueror';
  } else if (_includes(userAgent, 'Firefox')) {
    return 'Firefox';
  } else if (_includes(userAgent, 'MSIE') || _includes(userAgent, 'Trident/')) {
    return 'Internet Explorer';
  } else if (_includes(userAgent, 'Gecko')) {
    return 'Mozilla';
  }
  return '';
}

/**
 * derived from mixpanel so that our stats are consistent with page view props
 * source: https://github.com/mixpanel/mixpanel-js/blob/f8fe5b29ea90ab89df21e8db53c5fbaf0ebf8174/src/utils.js#L1442
 * @param {string} browserName
 * @param {string} userAgent
 * @returns {Number|null}
 */
function browserNameToVersion(browserName, userAgent) {
  var browserRegexMap = {
      'Internet Explorer Mobile': /rv:(\d+(\.\d+)?)/,
      'Microsoft Edge': /Edge\/(\d+(\.\d+)?)/,
      Chrome: /Chrome\/(\d+(\.\d+)?)/,
      'Chrome iOS': /CriOS\/(\d+(\.\d+)?)/,
      Safari: /Version\/(\d+(\.\d+)?)/,
      'Mobile Safari': /Version\/(\d+(\.\d+)?)/,
      Opera: /(Opera|OPR)\/(\d+(\.\d+)?)/,
      Firefox: /Firefox\/(\d+(\.\d+)?)/,
      'Firefox iOS': /FxiOS\/(\d+(\.\d+)?)/,
      Konqueror: /Konqueror:(\d+(\.\d+)?)/,
      BlackBerry: /BlackBerry (\d+(\.\d+)?)/,
      'Android Mobile': /android\s(\d+(\.\d+)?)/,
      'Internet Explorer': /(rv:|MSIE )(\d+(\.\d+)?)/,
      Mozilla: /rv:(\d+(\.\d+)?)/
    },
    regex = browserRegexMap[browserName],
    matches = regex && userAgent.match(regex);

  if (matches) {
    return parseFloat(matches[matches.length - 2]);
  }
  return null;
}

/**
 * derived from mixpanel so that our stats are consistent with page view props
 * source: https://github.com/mixpanel/mixpanel-js/blob/f8fe5b29ea90ab89df21e8db53c5fbaf0ebf8174/src/utils.js#L1451
 * @param {string} userAgent
 * @returns {string}
 */
function userAgentToOs(userAgent) {
  // disabling linting to keep code in-line with mixpanel as closely as possible
  /* eslint complexity: [2, 20] */
  if (/Windows/i.test(userAgent)) {
    if (/Phone/.test(userAgent) || /WPDesktop/.test(userAgent)) {
      return 'Windows Phone';
    }
    return 'Windows';
  } else if (/(iPhone|iPad|iPod)/.test(userAgent)) {
    return 'iOS';
  } else if (/Android/.test(userAgent)) {
    return 'Android';
  } else if (/(BlackBerry|PlayBook|BB10)/i.test(userAgent)) {
    return 'BlackBerry';
  } else if (/Mac/i.test(userAgent)) {
    return 'Mac OS X';
  } else if (/Linux/.test(userAgent)) {
    return 'Linux';
  }
  return '';
}

/**
 * returns an object with information about the viewing environment
 * @returns {object}
 */
function getBrowserInfo() {
  var navigator = window.navigator,
    userAgent = navigator.userAgent,
    vendor = navigator.vendor,
    browserName = getBrowserName(userAgent, vendor, window.opera);

  return {
    browser: browserName,
    browserVersion: browserNameToVersion(browserName, userAgent),
    os: userAgentToOs(userAgent)
  };
}

/**
 * These are the values accessible through `getPublicStateOnceReady`
 * @param {string} clientId
 * @param {number} currentTimestamp
 */
function setPublicState(clientId, currentTimestamp) {
  publicState = _assign(
    {
      clientId: clientId,
      currentUrl: window.location.href,
      firstVisitTimestamp: getFirstVisitTimestamp(),
      initialReferrer: localStorage.getItem(initialReferrerKey),
      isNewVisit: state.isNewVisit,
      pageUri: getPageUri(),
      referrer: document.referrer,
      screenHeight: window.screen.height,
      screenWidth: window.screen.width,
      timestamp: currentTimestamp,
      visitCount: getVisitCount(),
      userLoyalty: getUserLoyaltyLevel()
    },
    getBrowserInfo(),
    getUtmParams() // could do server-side
  );

  publicStateIsReady = true;
}

/**
 * check that publicState has been set before executing callbacks
 * @param {Function} callback
 */
function getPublicStateOnceReady(callback) {
  if (publicStateIsReady) {
    callback(_clone(publicState));
  } else {
    onceReadyQueue.push(callback);
  }
}

function executeOnceReadyQueue() {
  onceReadyQueue.forEach(callback => callback(_clone(publicState)));
  onceReadyQueue = [];
}

/**
 * maintain array of dates of a user's visits
 */
function updateVisitDates() {
  var visitDatesStr = localStorage.getItem(visitDatesKey) || '',
    visitDates = visitDatesStr.split(','),
    visitDatesLimitMilliseconds = visitDatesLimit * 24 * 60 * 60 * 1000, // visitDatesLimit in milliseconds
    thresholdTimeSinceLastVisit = 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    currentTime = Date.now();

  // remove dates older than threshold
  _remove(visitDates, function (visitDate) {
    return currentTime - visitDate > visitDatesLimitMilliseconds;
  });

  // add current time if at least 24 hours have elapsed since the visit
  if (visitDates.length === 0 || currentTime - visitDates[0] >= thresholdTimeSinceLastVisit) {
    visitDates.unshift(currentTime);
  }

  localStorage.setItem(visitDatesKey, visitDates.join(','));
}

/**
 * return user loyalty level
 * @returns {string}
 */
function getUserLoyaltyLevel() {
  var visitDatesStr = localStorage.getItem(visitDatesKey) || '',
    visitDates = visitDatesStr.split(',');

  if (visitDates.length <= 1) {
    return 'new';
  } else if (visitDates.length < 4) {
    return 'return';
  } else {
    return 'loyal';
  }
}

/**
 * This should be triggered only on load as that is when we track new visits.
 */
function init() {
  var currentTimestamp = Date.now();

  ensureClientId(currentTimestamp);
  state.onceClientIdIsReady(function (clientId) {
    ensureFirstVisitTimestamp(clientId);
    updateNewVisitState(currentTimestamp);

    if (state.isNewVisit) {
      setVisitStartTimestamp(currentTimestamp);

      incrementVisitCount();
      updateVisitDates();
      try {
        localStorage.setItem(initialReferrerKey, document.referrer);
      } catch (e) {
        // the browser failed to setItem, likely due to Private Browsing mode. We don't need to take any action
      }
    }
    setPreviousActionTimestamp(currentTimestamp);
    setPublicState(clientId, currentTimestamp);
    executeOnceReadyQueue();
  });
  window.document.addEventListener('click', extendVisit);
  // todo: might want to extendVisit based on other actions in the future
}

// init on load
init();

module.exports.onceReady = getPublicStateOnceReady;
module.exports.getQueryParamsObject = getQueryParamsObject;
module.exports.getBrowserInfo = getBrowserInfo;
