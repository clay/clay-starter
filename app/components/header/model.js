'use strict';

module.exports.save = function (uri, data) {
  if (data.siteLogo) {
    data.siteLogo = data.siteLogo.trim();

    if (data.siteLogo.substr(0,4).toLowerCase() === '<svg') {
      data.isSVGString = true;
    } else {
      data.isSVGString = false;
    }
  }

  return data;
};
