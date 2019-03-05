'use strict';

const $window = window,
  $document = document,
  _filter = require('lodash/filter'),
  _map = require('lodash/map'),
  _invokeMap = require('lodash/invokeMap'),
  _assign = require('lodash/assign'),
  _throttle = require('lodash/throttle'),
  Eventify = require('eventify');
var list = [],
  Visible, VisibleEvent;

/**
 * @param {number} a
 * @param {number} b
 * @returns {*}
 * @see http://jsperf.com/math-min-vs-if-condition-vs/8
 */
function min(a, b) {
  return a < b ? a : b;
}

/**
 * @param {number} a
 * @param {number} b
 * @returns {*}
 * @see http://jsperf.com/math-min-vs-if-condition-vs/8
 */
function max(a, b) {
  return a > b ? a : b;
}

/**
 * Fast loop through watched elements
 */
function updateVisibility() {
  list.forEach(updateVisibilityForItem);
}

/**
 * updates seen property
 * @param  {Visble} item
 * @param  {{}} evt
 * @fires Visible#shown
 * @fires Visible#hidden
 */
function updateSeen(item, evt) {
  var px = evt.visiblePx,
    percent = evt.visiblePercent;

  // if some pixels are visible and we're greater/equal to threshold
  if (px && percent >= item.shownThreshold && !item.seen) {
    item.seen = true;
    setTimeout(function () {
      item.trigger('shown', new VisibleEvent('shown', evt));
    }, 15);

    // if no pixels or percent is less than threshold
  } else if ((!px || percent < item.hiddenThreshold) && item.seen) {
    item.seen = false;
    setTimeout(function () {
      item.trigger('hidden', new VisibleEvent('hidden', evt));
    }, 15);
  }
}

/**
 * sets preload property
 * @param  {Visible} item
 * @param  {{}} evt
 * @param  {Number} innerHeight
 * @fires Visible#preload
 */
function updatePreload(item, evt, innerHeight) {
  if (!item.preload && item.preloadThreshold && shouldBePreloaded(evt.target, evt.rect, item.preloadThreshold, innerHeight)) {
    item.preload = true;
    setTimeout(function () {
      item.trigger('preload', new VisibleEvent('preload', evt));
    }, 15);
  }
}

/**
 * Trigger events
 * @param {Visible} item
 */
function updateVisibilityForItem(item) {
  var rect = item.el.getBoundingClientRect(),
    innerHeight = $window.innerHeight || $document.documentElement.clientHeight,
    px = getVerticallyVisiblePixels(rect, innerHeight),
    percent = px / (rect.height || innerHeight),
    evt = {
      target: item.el,
      rect: rect,
      visiblePx: px,
      visiblePercent: percent
    };

  updateSeen(item, evt);
  updatePreload(item, evt, innerHeight);
}

/**
 * make sure an element isn't hidden by styles or etc
 * @param  {Element}  el
 * @return {Boolean}
 */
function isElementNotHidden(el) {
  return el && el.offsetParent !== null && !el.getAttribute('hidden') && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden';
}

/**
 * @param {Element} el
 * @param  {ClientRect} rect
 * @param {Number} preloadThreshold
 * @param {Number} innerHeight
 * @return {Boolean}
 */
function shouldBePreloaded(el, rect, preloadThreshold, innerHeight) {
  return rect.bottom > preloadThreshold * -1 && rect.top <= innerHeight + preloadThreshold && isElementNotHidden(el);
}

/**
 * @param {ClientRect} rect
 * @param {number} innerHeight
 * @returns {number}
 */
function getVerticallyVisiblePixels(rect, innerHeight) {
  return min(innerHeight, max(rect.bottom, 0)) - min(max(rect.top, 0), innerHeight);
}

/**
 * Get offset of element relative to entire page
 *
 * @param {Element} el
 * @returns {{left: number, top: number}}
 * @see http://jsperf.com/offset-vs-getboundingclientrect/7
 */
function getPageOffset(el) {
  var offsetLeft = el.offsetLeft,
    offsetTop = el.offsetTop;

  while (el = el.offsetParent) {
    offsetLeft += el.offsetLeft;
    offsetTop += el.offsetTop;
  }

  return {
    left: offsetLeft,
    top: offsetTop
  };
}

/**
 * Create a new Visible class to observe when elements enter and leave the viewport
 *
 * Call destroy function to stop listening (this is until we have better support for watching for Node Removal)
 * @param {Element} el
 * @param {Object} [options]
 * @param {number} [options.preloadThreshold]
 * @param {number} [options.shownThreshold] Percentage of element that must be visible to trigger a "shown" event
 * @param {number} [options.hiddenThreshold] Percentage of element that must be visible to trigger a "hidden" event
 * @class
 * @example  this.visible = new $visibility.Visible(el);
 */
Visible = function (el, options) {
  options = options || {};
  this.el = el;
  this.seen = false;
  this.preload = false;
  this.preloadThreshold = options && options.preloadThreshold || 0;
  this.shownThreshold = options && options.shownThreshold || 0;
  this.hiddenThreshold = options && min(options.shownThreshold, options.hiddenThreshold) || 0;

  // protect against adding undefined elements which cause the entire service to error on scroll if theyre added to the list
  if (this.el) {
    list.push(this);
    updateVisibilityForItem(this); // set immediately to visible or not
  }
};
Visible.prototype = {
  /**
   * Stop triggering.
   */
  destroy: function () {
    // remove from list
    var index = list.indexOf(this);

    if (index > -1) {
      list.splice(index, 1);
    }
  }
  /**
   * @name Visible#on
   * @function
   * @param {'shown'|'hidden'} e  EventName
   * @param {function} cb  Callback
   */
  /**
   * @name Visible#trigger
   * @function
   * @param {'shown'|'hidden'} e
   * @param {{}}
   */
};
Eventify.enable(Visible.prototype);

VisibleEvent = function (type, options) {
  this.type = type;
  _assign(this, options);
};

// listen for scroll events (throttled)
$document.addEventListener('scroll', _throttle(updateVisibility, 200));

// public
module.exports.getPageOffset = getPageOffset;
module.exports.getVerticallyVisiblePixels = getVerticallyVisiblePixels;
module.exports.isElementNotHidden = isElementNotHidden;
module.exports.Visible = Visible;
module.exports.updateVisibility = updateVisibility;
