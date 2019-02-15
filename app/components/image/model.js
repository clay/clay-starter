'use strict';

const _get = require('lodash/get'),
  defaultWidth = 'inline';

module.exports.render = function (uri, data) {
  return data;
};

module.exports.save = function (uri, data) {
  const imageAspectRatio = _get(data, 'imageAspectRatio', null),
    imageAspectRatioFlexOverride = _get(data, 'imageAspectRatioFlexOverride', false),
    imageCaption = _get(data, 'imageCaption', null),
    imageCreditOverride = _get(data, 'imageCreditOverride', null),
    imageUrl = _get(data, 'imageUrl', null),
    imageWidth = _get(data, 'imageWidth', null) || defaultWidth,
    image = {
      imageAspectRatio,
      imageAspectRatioFlexOverride,
      imageCaption,
      imageCredit: imageCreditOverride,
      imageType: 'Photo',
      imageUrl,
      imageWidth
    };

  return Object.assign(data, image);
};
