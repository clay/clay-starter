'use strict';

const sanitize = require('../../services/universal/sanitize');

module.exports.save = function (ref, data) {
  data.text = sanitize.validateTagContent(sanitize.toSmartText(data.text || ''));
  data.css = data.type;
  data.subheaderid = `${data.subheaderid || data.text}`.trim().replace(/\s+/g, '-');
  return data;
};
