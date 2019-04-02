'use strict';

const db = require('amphora-storage-postgres');

/**
 * Replace or create a new value in the db.
 *
 * @param {string} ref
 * @param {function} fn
 * @returns {Promise}
 */
function update(ref, fn) {
  return db
    .get(ref)
    .catch(function() {
      // doesn't exist yet
      return null;
    })
    .then(function(value) {
      return fn(value);
    })
    .then(function(result) {
      if (result) {
        // must be object or array
        if (!(typeof result === 'object')) {
          throw new Error('Must be object');
        }

        return db.put(ref, JSON.stringify(result));
      }
    });
}

module.exports.get = db.get;
module.exports.put = db.put;
module.exports.del = db.del;
module.exports.getMeta = db.getMeta;
module.exports.update = update;
