'use strict';

/**
 * ========
 * Overview
 * ========
 *
 * This `$gtm` service is a hub for Google Tag Manager (GTM) and does the following:
 *
 * 1. Loads GTM if the `gtm` component is on the page and `head-gtm` is not in the head
 *
 * 2. Reports events from client.js of components:
 *    - `$gtm.reportNow` reports immediately,
 */

var eventsQueue = [], // enables us to send multiple events with one dataLayer push  and pixel fire to google
  isCurrentlyReporting = false;

window.dataLayer = window.dataLayer || [];

/**
 * queues any events given in the params and reports the queue immediately
 * @param {...object} optional event(s)
 */
function reportNow() {
  eventsQueue.push.apply(eventsQueue, arguments);
  if (!isCurrentlyReporting) {
    isCurrentlyReporting = true;
    if (eventsQueue.length > 0) {
      window.dataLayer.push.apply(window.dataLayer, eventsQueue);
      eventsQueue = [];
    }
    isCurrentlyReporting = false;
  }
}

module.exports.reportNow = reportNow;
