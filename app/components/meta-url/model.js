'use strict';

/**
 * set component canonical url and date if they're passed in through the locals
 * @param {object} data
 * @param {object} [locals]
 */
function setFromLocals(data, locals) {
  if (locals && locals.publishUrl) {
    data.url = locals.publishUrl;
  }

  if (locals && locals.date) {
    data.date = locals.date;
  }
}

module.exports.save = (ref, data, locals) => {
  setFromLocals(data, locals);
  return data;
};
