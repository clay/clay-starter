'use strict';

const utils = require('../../services/universal/utils'),
  styles = require('../../services/universal/styles'),
  SPACING_MAP = {
    small: 20,
    medium: 40,
    large: 60
  };

function mapSpacing(data) {
  if (!data.spacing || data.spacing === 'none') {
    data.spacingVal = 0;
  } else {
    data.spacingVal = SPACING_MAP[data.spacing];
  }

  return data;
}

function parseCustomStyles(ref, data) {
  return new Promise(resolve => {
    if (!utils.isFieldEmpty(data.sass)) {
      return styles.render(ref, data.sass).then((css) => {
        data.css = css;
        return resolve(data);
      });
    } else {
      data.css = '';
    }

    return resolve(data);
  })
}

function parseRatio(data) {
  if (!data.ratio) {
    data.ratio = 'even';
  }

  return data;
}

module.exports.save = (ref, data) => {
  return parseCustomStyles(ref, data)
    .then(mapSpacing)
    .then(parseRatio);
};
