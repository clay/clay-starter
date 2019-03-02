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
 *    - whereas `$gtm.reportSoon` will send the event in the next batch.
 *    - example components: `clay-share` and `share-button`
 *
 * 3. Reports events based on data-attributes as defined in component templates.
 *    - see the `config` below for details on specific data-attributes
 *
 * 4. Pushed events to the dataLayer in batches, which are then sent to GTM and GA
 *    - `eventsQueue` array is the queue
 *    - `processQueueDelay` defines the frequency of reporting batches
 *    - the queue is also reported when the mouse exits the top of the window
 *    - there could be more optimizations here in the future
 *
 */

var page = require('./page'),
  initializedOnLoad = false,
  vertical = page.getVertical(),
  pageType = page.getPageType(),
  author = page.getAuthor(),
  eventsQueue = [], // enables us to send multiple events with one dataLayer push  and pixel fire to google
  isCurrentlyReporting = false,
  processQueueDelay = 1000 * 30,// wait 30 seconds before reporting in case more events happen
  typeAttr = 'data-track-type',
  zoneAttr = 'data-track-zone',
  pageZoneAttr = 'data-page-zone',
  verticalPositionAttr = 'data-vertical-position',
  gtmPageZoneKey = 'pageZone',
  gtmVerticalPositionKey = 'verticalPosition',
  publicVisitState;
const dom = require('@nymag/dom'),
  _assign = require('lodash/assign'),
  _find = require('lodash/find'),
  _debounce = require('lodash/debounce'),
  _each = require('lodash/each'),
  productLinks = require('./product-links'),
  $visibility = require('./visibility'),
  visit = require('./visit.js'),

  /**
   * the `config`
   *
   * anything unique to an event type should be added to the config below
   * changes made here may require a corresponding change in component templates
   * `data-track-type` is used as keys below
   * the `init` function is run on load and can be used to add event listeners
   * the `getDataOnView` function is optional and can add data at the time of the view or event
   */
  config = {
    /**
     *
     * An `article-detail` is for the full article
     *
     * - Add `data-track-type="article-detail"` to the article element
     * - Add data-track variables used in the `init` function below
     * - Example: https://github.com/nymag/sites/blob/master/components/article/template.handlebars#L1
     *
     */
    'article-detail': {
      init: function (el) {
        var crosspostString = el.getAttribute('data-crosspost') ? 'cross-posted' : '',
          syndicationString = getSyndicationString(el),
          dataOnLoad = {
            id: el.getAttribute('data-uri'),
            name: el.getAttribute('data-headline'),
            brand: vertical,
            category: el.getAttribute('data-content-channel'),
            variant: el.getAttribute('data-type'),
            dimension1: el.getAttribute('data-authors'),
            dimension2: el.getAttribute('data-headline'),
            dimension3: el.getAttribute('data-publish-date'),
            dimension19: el.getAttribute('data-tags'),
            dimension45: crosspostString && syndicationString ? crosspostString + ', ' + syndicationString : crosspostString || syndicationString
          };

        if (window.fbq) {
          window.fbq('track', 'ViewContent', {content_name: dataOnLoad.brand, content_category: dataOnLoad.category, content_type: 'product', content_ids: [dataOnLoad.variant]});
        }

        module.exports.reportSoon({
          // We support both `articleDetail` and `productDetail` as GTM triggers;
          // the latter is used on legacy pages, whereas the former is used here
          event: 'articleDetail',
          ecommerce: {
            detail: {
              products: [dataOnLoad]
            }
          }
        });
      }
    },
    /**
     * An article-list is any group of one or more articles that are used to recirculate
     *
     * - Add `data-track-type="article-list"` to the element containing article(s)
     * - Add data-track variables used in the `init` function below
     *
     * example: https://github.com/nymag/sites/blob/master/components/most-popular/template.handlebars#L1
     */
    'article-list': {
      init: function (el, dataTrackType) {
        var dataUri = el.getAttribute('data-uri'),
          childTrackEl = el.querySelector('[' + typeAttr + ']'),
          dataOnLoad = {
            id: dataUri,
            name: el.getAttribute('data-track-name') ||
              (dataUri || '').split('/_components/').pop().split('/')[0],
            list: page.getPageUri(),
            // uses data-track-type of child:
            // could hard-code this in the template if it does not work in future cases
            variant: childTrackEl && childTrackEl.getAttribute(typeAttr),
            brand: vertical,
            category: page.getChannel(),
            dimension23: dataTrackType,
            // This is for the `ooyala-recirc-lede` component tracking video source
            dimension39: el.getAttribute('data-track-video-source') || 'undefined'
          };

        addEcommProductEvents(el, dataTrackType, dataOnLoad, {
          impressionName: 'componentImpressions',
          clickName: 'componentClick'
        });
      },
      getDataOnView: getPosition
    },
    /**
     * An article-link is a link to another article, normally within an article-list
     *
     * - Add `data-track-type="article-link"` to the element containing the link
     * - Add data-track variables used in the `init` function below
     *
     * example: https://github.com/nymag/sites/blob/master/components/most-popular/template.handlebars#L21-L23
     */
    'article-link': {
      init: function (el, dataTrackType) {
        var authorsOnIndexPages = el.getAttribute('data-track-authors'),
          paginationOnIndexPages = el.getAttribute('data-track-pagination'),
          dataOnLoad = {
            id: el.getAttribute('data-track-page-uri'),
            name: el.getAttribute('data-track-headline'),
            position: el.getAttribute('data-track-index'),
            // useful to distinguish between multiple instances of the
            // components, like section components (homepage-section component)
            list: el.getAttribute('data-track-component-name'),
            dimension23: dataTrackType,
            dimension38: getNearestComponentTitle(el)
          };

        // authors and pagination are only required on "index" pages, e.g. homepage or section page
        if (authorsOnIndexPages) {
          dataOnLoad.dimension1 = authorsOnIndexPages;
        }
        if (paginationOnIndexPages) {
          dataOnLoad.dimension35 = paginationOnIndexPages;
        }

        addEcommProductEvents(el, dataTrackType, dataOnLoad, {
          impressionName: 'articleImpressions',
          clickName: 'articleClick'
        });
      }
    },
    /**
     * A product-list is any group of one or more products
     *
     * - If a `product-link` is not within a `product-list` then the pageUri is used as the list id
     * - Add `data-track-type="product-list"` to the element containing product(s)
     * - Add data-track variables used in the `init` function below
     * - The element should have data-uri
     *
     * example: https://github.com/nymag/sites/blob/master/components/product-hits/template.handlebars#L1
     */
    'product-list': {
      init: function (el, dataTrackType) {
        var dataUri = el.getAttribute('data-uri'),
          childTrackEl = el.querySelector('[' + typeAttr + ']'),
          dataOnLoad = {
            id: dataUri,
            name: el.getAttribute('data-track-name') ||
              (dataUri || '').split('/_components/').pop().split('/')[0],
            list: page.getPageUri(),
            // uses data-track-type of child:
            // could hard-code this in the template if it does not work in future cases
            variant: childTrackEl && childTrackEl.getAttribute(typeAttr),
            brand: vertical,
            category: page.getChannel(),
            dimension23: dataTrackType
          };

        addEcommProductEvents(el, dataTrackType, dataOnLoad, {
          impressionName: 'componentImpressions',
          clickName: 'componentClick'
        });
      },
      getDataOnView: getPosition
    },
    /**
     * A product-link is a link to product
     *
     * - Add `data-track-type="product-link"` to the element containing the link
     * - Add data-track variables used in the `init` function below
     *
     * example: https://github.com/nymag/sites/blob/master/components/product-hit/template.handlebars#L10
     */
    'product-link': {
      init: function (el, dataTrackType, visitState) {
        var inlineProductVariant = 'product - link',
          dataOnLoad = {
            id: el.getAttribute('data-track-id'),
            name: el.getAttribute('data-track-name'),
            brand: el.getAttribute('data-track-brand') || vertical,
            // default to inline product variant so that we do not need to set another data-attribute for all inline product links
            variant: el.getAttribute('data-track-variant') || inlineProductVariant,
            dimension23: dataTrackType,
            // default list id to the page uri (e.g. for links within paragraphs)
            list: el.getAttribute('data-track-component-name') || page.getPageUri(),
            dimension47: el.getAttribute('data-track-test-group')
          };

        // process product-link (e.g. add/extend amazon subtag)
        // NOTE: not ideal to bundle product-link behavior into an analytics reporting service,
        // but adding here has the performance benefit of avoiding duplicate dom querying to find product-links
        productLinks.initLink(el, visitState);
        addEcommProductEvents(el, dataTrackType, dataOnLoad, {
          impressionName: 'productImpressions',
          clickName: 'productClick'
        });
      }
    },
    /**
     * A newsletter-signup is a form to subscribe to a newsletter
     *
     * - Add `data-track-type="newsletter-signup"` to the element containing the newsletter signup form
     * - Add data-track variables used in the `init` function below
     *
     * example: https://github.com/nymag/sites/blob/master/components/newsletter-sign-up/template.handlebars#L1
     */
    'newsletter-signup': {
      init: function (el, dataTrackType) {
        var eventName = 'newsletter',
          dataOnLoad = {
            // `newsletter` value is different for impression and click
            // `pageZone` and `verticalPosition` handled by `getPosition`
            newsletterId: el.getAttribute('data-track-id'),
            dimension23: dataTrackType
          },
          elForm = el.querySelector('form'),
          newsletterPrefix = el.parentElement && el.parentElement.classList.contains('modal') ? 'nl modal ' : 'nl sub ';

        queueOnceVisible(el, dataTrackType, dataOnLoad, function queueCustomEventImpression(el, dataTrackType, dataOnLoad) {
          eventsQueue.push(_assign({
            event: eventName,
            newsletter: newsletterPrefix + 'display' // todo: move this into gtm with another event trigger name
          }, addDataOnView(el, dataTrackType, dataOnLoad)));
        });
        if (elForm) {
          elForm.addEventListener('submit', function (e) {
            e.preventDefault();
            module.exports.reportNow(_assign({
              event: eventName,
              newsletter: newsletterPrefix + 'submit',
              dimension23: dataTrackType
            }, addDataOnView(el, dataTrackType, dataOnLoad)));
          });
        }
      },
      getDataOnView: getPosition
    },
    /**
     * A subscription is the promotion for a newsletter signup: what the user clicks on to get to the form
     *
     * - Add `data-track-type="subscription-item"` to the element containing the subscription promo
     * - Add data-track variables used in the `init` function below
     *
     * example: https://github.com/nymag/sites/blob/15942970e53b04b5ac9d66aec0afd5dce5bd0399/_components/di-header/template.handlebars#L9
     */
    'subscription-item': {
      init: function (el, type) {
        var id = el.getAttribute('data-track-id'),
          creative = el.getAttribute('data-track-creative'),
          promoClick = {
            ecommerce: {
              promoClick: {
                promotions: [{
                  id: id,
                  name: id,
                  creative: creative
                }]
              }
            }
          };

        if (el) {
          el.addEventListener('click', function () {
            module.exports.reportNow(_assign({
              event: 'promotionClick'
            }, addDataOnView(el, type, promoClick)));
          });
        }
      }
    },
    /**
     * A subscription view is the promotion for a newsletter signup: the module a user scrolls over before selecting a subscription type, e.g. gift subscription
     *
     * - Add `data-track-type="subscription-list"` to the element containing the subscription promotion module
     * - Add data-track variables used in the `init` function below
     *
     * example: https://github.com/nymag/sites/blob/15942970e53b04b5ac9d66aec0afd5dce5bd0399/components/di-header/template.handlebars#L8
     */
    'subscription-list': {
      init: function (el, type) {
        var id = el.getAttribute('data-track-type'),
          promoView = {
            ecommerce: {
              promoView: {
                promotions: [{
                  id: id,
                  name: id
                }]
              }
            }
          };

        queueOnceVisible(el, type, promoView, function queueCustomEventImpression(el, type, promoView) {
          eventsQueue.push(_assign({
            event: 'promoView'
          }, addDataOnView(el, type, promoView)));
        });
      }
    }
  };

function getSyndicationString(el) {
  var syndicationAttr = el.getAttribute('data-syndication'),
    syndicatedCopy = syndicationAttr === 'copy' ? 'syndicated copy' : '',
    syndicatedOriginal = syndicationAttr === 'syndicated' ? 'syndicated original' : '';

  return syndicatedCopy || syndicatedOriginal;
}

window.dataLayer = window.dataLayer || [];

/**
 * get the component title from itself or parent
 * @param {Element} el
 * @returns {*|string}
 */
function getNearestComponentTitle(el) {
  var dataAttribute = 'data-track-component-title',
    title = el && el.getAttribute(dataAttribute),
    parentEl;

  // in some cases data attribute is attached to the parent component
  if (!title) {
    parentEl = dom.closest(el, '[' + dataAttribute + ']');
    title = parentEl && parentEl.getAttribute(dataAttribute);
  }
  return title;
}

/**
 * adds standard click and impression tracking for e-commerce products
 * @param {Element} el
 * @param {string} type
 * @param {object} dataOnLoad
 * @param {object} eventNames
 * @param {string} eventNames.impressionName
 * @param {string} eventNames.clickName
 */
function addEcommProductEvents(el, type, dataOnLoad, eventNames) {
  queueOnceVisible(el, type, dataOnLoad, queueEcommProductImpression(eventNames.impressionName));
  addEcommProductClickHandler(el, type, dataOnLoad, eventNames.clickName);
}

/**
 * push impression events to the events queue
 * @param {string} eventName
 * @returns {Function}
 */
function queueEcommProductImpression(eventName) {
  return function (el, type, dataOnLoad) {
    var impressionData = addDataOnView(el, type, dataOnLoad),
      impressionsContainer = _find(eventsQueue, function (eventContainer) {
        return eventContainer.event === eventName;
      });

    if (impressionsContainer) {
      impressionsContainer.ecommerce.impressions.push(impressionData);
    } else {
      eventsQueue.push({
        event: eventName,
        ecommerce: {
          impressions: [impressionData]
        }
      });
    }
  };
}

/**
 * Adds zone attributes:
 *  Vertical Position is a percentage based on how far the top of the component is from the top of the zone.
 *  Page Zone is the name of the zone
 *
 * We wait as long as possible (i.e. until the element is visible) to calculate
 * so that there is time for images to load/height of elements to be more stable.
 *
 * On subsequent calls, the value will be retrieved from the data-attribute on the element.
 * @param {Element} el
 * @returns {object}
 */
function getPosition(el) {
  var zone, zoneRect, elRect,
    // attempt to get zone previously found
    pageZone = el.getAttribute(pageZoneAttr),
    verticalPosition = el.getAttribute(verticalPositionAttr),
    obj = {};

  if (!pageZone || !verticalPosition) {
    // get zone for the first time
    zone = dom.closest(el, '[' + zoneAttr + ']');
    if (zone) {
      pageZone = zone.getAttribute(zoneAttr);
      zoneRect = zone.getBoundingClientRect();
      elRect = el.getBoundingClientRect();
      verticalPosition = +((elRect.top - zoneRect.top) / zoneRect.height).toFixed(2);
      // store value for subsequent requests
      el.setAttribute(pageZoneAttr, pageZone);
      el.setAttribute(verticalPositionAttr, verticalPosition);
    }
  }
  obj[gtmPageZoneKey] = pageZone;
  obj[gtmVerticalPositionKey] = parseInt(verticalPosition, 10); // ensure number in case from data-attr
  return obj;
}

/**
 * test if the element is likely an image
 * @param {Element} el
 * @returns {boolean}
 */
function isImage(el) {
  var nodeName = (el && el.nodeName || '').toLowerCase();

  switch (nodeName) {
    case 'img':
    case 'svg':
    case 'path':
    case 'canvas':
      return true;
    default:
      return false;
  }
}

/**
 * report product click through the eventsQueue
 * by adding to the eventsQueue, all other queued events will report with one pixel fire
 * @param {Element} el
 * @param {string} type
 * @param {object} dataOnLoad
 * @param {string} eventName
 */
function addEcommProductClickHandler(el, type, dataOnLoad, eventName) {
  var optionFromEl = el.getAttribute('data-track-option');

  el.addEventListener('click', function (e) {
    var data = addDataOnView(el, type, dataOnLoad),
      target = e.target;

    module.exports.reportNow({
      event: eventName,
      ecommerce: {
        click: {
          actionField: {
            list: data.list,
            option: optionFromEl || target && target.getAttribute('data-track-option') || (isImage(target) ? 'Image' : 'Text')
          },
          products: [ data ]
        }
      }
    });
  });
}

/**
 * this adds values that cannot be added on page load
 * some data is only accurate at the time of the event, e.g. position
 * NOTE: we assume that keys returned here are the same as in gtm
 * this is set in the config with a `getDataOnView` function
 * @param {Element} el
 * @param {string} type
 * @param {object} dataOnLoad
 * @returns {Object}
 */
function addDataOnView(el, type, dataOnLoad) {
  var fn = config[type].getDataOnView;

  return fn ? _assign(dataOnLoad, fn(el)) : dataOnLoad;
}

/**
 * once the element is visible, then add it to a queue to be reported in batches
 * @param {Element} el
 * @param {string} type
 * @param {object} dataOnLoad -- data for the event available on page load
 * @param {Function} addToQueueFn
 */
function queueOnceVisible(el, type, dataOnLoad, addToQueueFn) {
  var visible = new $visibility.Visible(el, { shownThreshold: 0.5 });

  visible.on('shown', function () {
    if ($visibility.isElementNotHidden(el)) {
      addToQueueFn(el, type, dataOnLoad);
      module.exports.reportSoon();
    }
  });
}

/**
 * queues any events given in the params and reports with the next batch of events
 * @param {...object} optional event(s)
 * @returns {Function}
 */
function debounceReportNow() {
  var debouncedReportNow = _debounce(module.exports.reportNow, processQueueDelay);

  return function () {
    eventsQueue.push.apply(eventsQueue, arguments);
    debouncedReportNow();
  };
}

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

/**
 * scrape all of the components on the page that have event attributes
 * and run their init function
 * @param {object} visitState
 * @param {Element} element - optional parent element to query inside
 */
function initializeEventsFromDom(visitState, element) {
  var elementContainer = element ? element : document.body,
    eventElements = elementContainer.querySelectorAll('[' + typeAttr + ']');


  _each(eventElements, function (el) {
    var type = el.getAttribute(typeAttr),
      typeConfig = config[type];

    if (typeConfig && typeConfig.init) {
      typeConfig.init(el, type, visitState);
    }
  });
}

/**
 * Initialize all trackable elements in the provided container element
 * useful for tracking elements added to the page after the initial load
 *
 * @param {Element} el
 */
function initializeElement(el) {
  if (!initializedOnLoad) { return; }

  initializeEventsFromDom(publicVisitState, el);
}

/**
 * loads GTM and initializes the dataLayer
 * @param {string} containerId
 * @param {object} visitState
 * @param {string} visitState.clientId
 * @param {string} visitState.pageUri
 */
function initializeGtmAndDataLayer(containerId, visitState) {
  //  dataLayer push prior to loading GTM
  module.exports.reportNow({
    event: 'dataLayer-initialized',
    userDetails: {
      newYorkMediaUserID: visitState.clientId,
      loyaltyLevel: visitState.userLoyalty
    },
    pageDetails: {
      pageUri: visitState.pageUri,
      vertical: vertical,
      pageType: pageType,
      author: author
    }
  });

  // Load GTM: https://developers.google.com/tag-manager/quickstart
  /* eslint-disable */
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer',containerId);
  /* eslint-enable */
}

/**
 * loads gtm; called by `gtm` component which places gtm in the body
 * @param {string} containerId  - GTM container id to load
 */
function initGtm(containerId) {
  const isGtmLoadedByGtmHead = !!document.head.querySelector('.head-gtm');

  if (initializedOnLoad) {
    return; // run only once
  }
  initializedOnLoad = true;
  visit.onceReady(function (visitState) {
    publicVisitState = visitState;

    if (!isGtmLoadedByGtmHead) {
      // if page has `head-gtm` component, then gtm was already loaded inline in the head
      initializeGtmAndDataLayer(containerId, visitState);
    }
    initializeEventsFromDom(visitState);

    // report on load
    module.exports.reportNow();

    // report when user intends to exit
    document.addEventListener('mouseleave', function (e) {
      if (e.clientY < 0) {
        module.exports.reportNow();
      }
    }, false);
  });
}

/**
 * report a custom event
 * @param {object}  opts
 * @param {string}  opts.category - event category (e.g. 'interactives')
 * @param {string}  opts.action - event action (e.g. 'article end')
 * @param {string}  opts.label - event label (e.g. 'on=[page-url]')
 * @param {object}  [customDimensions] - optional argument for any numbered custom dimesions
 */

function reportCustomEvent(opts, customDimensions) {
  var category = opts.category,
    action = opts.action,
    label = opts.label,
    dimensions = {
      event: 'universalCustomEvent',
      customEventCategory: category && category.trim(),
      customEventAction: action && action.trim(),
      customEventLabel: label && label.trim()
    };

  if (!!customDimensions) {
    dimensions = Object.assign(dimensions, customDimensions);
  }

  reportNow(dimensions);
}

module.exports.init = initGtm;
module.exports.reportNow = reportNow;
module.exports.reportSoon = debounceReportNow.call(this);
module.exports.reportCustomEvent = reportCustomEvent;
module.exports.initializeElement = initializeElement;
