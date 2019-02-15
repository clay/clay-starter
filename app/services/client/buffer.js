'use strict';

/**
 * Base-64 encode a string
 *
 * @param  {String} string
 * @return {String}
 */
function encode(string) {
  if (typeof string !== 'string') {
    return string;
  }

  return window.btoa(string);
}

/**
 * Decode a Base-64 string to UTF-8
 *
 * @param  {String} string
 * @return {String}
 */
function decode(string) {
  if (typeof string !== 'string') {
    return string;
  }

  return window.atob(string);
}

module.exports.encode = encode;
module.exports.decode = decode;
