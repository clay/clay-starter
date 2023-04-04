'use strict';

/**
 * bluebird.props with native promises
 * @param {Object} props
 * @returns {Promise}
 */
module.exports.props = (props) => {
  return Promise.all(Object.keys(props).map((key) => Promise.resolve(props[key]).then((res) => ({ [key]: res }))))
    .then((resolvedArray) => resolvedArray.reduce((memo, oneRes) => {
      const key = Object.keys(oneRes)[0];

      memo[key] = oneRes[key];

      return memo;
    }, {}));
};

/**
 * simple and easy promise timeout
 * @param {Promise} promise
 * @param {number} time    number of milliseconds to allow the promise to resolve
 * @return {Promise}
 */
module.exports.timeout = (promise, time) => {
  let timer = null;

  return Promise.race([
    new Promise((resolve, reject) => {
      timer = setTimeout(reject, time, new Error('Timed out!'));

      return timer;
    }),
    promise.then((value) => {
      clearTimeout(timer);

      return value;
    })
  ]);
};
