'use strict';

const sanitize = require('../../services/universal/sanitize');

module.exports.save = function (ref, data) {
  data.text = sanitize.validateTagContent(sanitize.toSmartText(data.text || ''));

  return data;
};
