'use strict';

const _isEmpty = require('lodash/isEmpty'),
  _isObject = require('lodash/isObject'),
  _head = require('lodash/head');

module.exports.save = function(ref, data) {
  // convert array of {text: string} objects into regular array of strings
  if (!_isEmpty(data.tags) && _isObject(_head(data.tags))) {
    data.tags = data.tags.map(tag => tag.text);
  }

  return data;
};
