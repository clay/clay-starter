'use strict';

const sanitize = require('../../services/universal/sanitize');

module.exports.save = (ref, data) => {
  data = sanitize.recursivelyStripSeperators(data);

  if (!data.kilnTitle) {
    data.kilnTitle = data.title;
  } else if (!data.title && data.kilnTitle) {
    // If the pagelist has title, but metatag is empty
    data.title = data.kilnTitle;
  }

  return data;
};
