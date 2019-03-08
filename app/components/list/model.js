'use strict';

const striptags = require('striptags'),
  { has, isFieldEmpty } = require('../../services/universal/utils'),
  { render } = require('../../services/universal/styles'),
  { toSmartText } = require('../../services/universal/sanitize');

module.exports.save = function (uri, data) {
  const allowedTags = ['strong', 'em', 's', 'a', 'span'];

  data.orderedList ? data.listType = 'ol' : data.listType = 'ul';

  if (has(data.items)) {
    data.items.forEach((item) => {
      item.text = toSmartText(striptags(item.text, allowedTags));
    });
  }

  if (isFieldEmpty(data.sass)) {
    delete data.css;

    return data;
  } else {
    return render(uri, data.sass)
      .then((css) => {
        data.css = css;

        return data;
      });
  }
};
