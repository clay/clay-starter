'use strict';

/**
 * @todo remove data.articles after https://github.com/clay/clay-starter/issues/25
 */
module.exports.render = (uri, data) => {
  data.articles = [{},{},{}];
  return data;
};

module.exports.save = (ref, data) => {
  return data;
};
