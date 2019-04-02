'use strict';

module.exports.save = function(uri, data) {
  if (data.siteLogo) {
    data.isSVGString =
      data.siteLogo
        .trim()
        .substr(0, 4)
        .toLowerCase() === '<svg';
  }

  return data;
};
