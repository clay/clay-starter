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

  return Buffer.from(string, 'utf8').toString('base64');
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

  return Buffer.from(string, 'base64').toString('utf8');
}

module.exports.encode = encode;
module.exports.decode = decode;
