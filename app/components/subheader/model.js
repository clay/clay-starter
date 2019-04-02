'use strict';

const sanitize = require('../../services/universal/sanitize');

module.exports.save = function(ref, data) {
  data.text = sanitize.validateTagContent(sanitize.toSmartText(data.text || ''));
  data.subheaderId = `${data.subheaderId || data.text}`.trim().replace(/\s+/g, '-');
  return data;
};
