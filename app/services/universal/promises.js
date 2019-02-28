'use strict';

/**
 * bluebird.props with native promises
 * @param {object} props
 * @returns {Promise}
 */
module.exports.props = function (props) {
  return Promise.all(Object.keys(props).map(function (key) {
    return Promise.resolve(props[key]).then(function (res) {
      let one = {};

      one[key] = res;
      return one;
    });
  }))
    .then(function (resolvedArray) {
      return resolvedArray.reduce(function (memo, oneRes) {
        let key = Object.keys(oneRes)[0];

        memo[key] = oneRes[key];
        return memo;
      }, {});
    });
};

/**
 * simple and easy promise timeout
 * @param  {Promise} promise
 * @param  {number} time    number of milliseconds to allow the promise to resolve
 * @return {Promise}
 */
module.exports.timeout = function (promise, time) {
  let timer = null;

  return Promise.race([
    new Promise(function (resolve, reject) {
      timer = setTimeout(reject, time, new Error('Timed out!'));
      return timer;
    }),
    promise.then(function (value) {
      clearTimeout(timer);
      return value;
    })
  ]);
};
