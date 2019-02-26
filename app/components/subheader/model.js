'use strict';

const sanitize = require('../../services/universal/sanitize');

module.exports.save = function (ref, data) {
  data.text = sanitize.validateTagContent(
    sanitize.toSmartText(data.text || '')
  );
  const hash = `${data.link || data.text}`.replace(/\s+/g, '-');

  data.css = data.type;
  data.link = hash;
  console.log(data.link);
  debugger;
  return data;
};
