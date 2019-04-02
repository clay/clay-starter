'use strict';

const _includes = require('lodash/includes');

function isVideo(contentData) {
  return (
    contentData.featureTypes &&
    (contentData.featureTypes['Video-Original'] ||
      contentData.featureTypes['Video-Aggregation'] ||
      contentData.featureTypes['Video-Original News'])
  );
}

function isGallery(contentData) {
  return contentData.tags && _includes(contentData.tags, 'gallery');
}

function getCalloutType(contentData) {
  if (isVideo(contentData)) {
    return 'video';
  }

  if (isGallery(contentData)) {
    return 'gallery';
  }

  return '';
}

module.exports = getCalloutType;
