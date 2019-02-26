'use strict';

const sanitize = require('../../services/universal/sanitize');

module.exports.save = function (ref, data) {
  data.text = sanitize.validateTagContent(
    sanitize.toSmartText(data.text || '')
  );
  data.css = data.type;
  data.subheaderid = `${data.link || data.text}`.replace(/\s+/g, '-');
  data.iconcss = 'link';
  return data;
};
