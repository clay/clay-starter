'use strict';

const sanitize = require('../../services/universal/sanitize');

module.exports.save = (ref, data) => {
  data = sanitize.recursivelyStripSeperators(data);

  if (!data.kilnTitle) {
    data.kilnTitle = data.ogTitle;
  } else if (!data.ogTitle && !data.title && data.kilnTitle) { // If the pagelist has title, but metatag is empty
    data.ogTitle = data.kilnTitle;
    data.title = data.kilnTitle;
  }

  return data;
};
