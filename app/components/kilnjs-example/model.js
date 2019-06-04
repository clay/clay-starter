'use strict';

module.exports.save = function (uri, data) {

  return data;
};


module.exports.beforeRender = function (uri, data) {
  data.title = data.title;

  return data;
};


module.exports.render = function (uri, data) {

  data.title = data.title;

  return data;
};
