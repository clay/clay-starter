'use strict';

var postcss = require('postcss'),
  nested = require('postcss-nested'),
  safe = require('postcss-safe-parser'),
  csso = require('postcss-csso'),
  simpleVars = require('postcss-simple-vars');

/**
 * render scoped css using postcss
 * @param {string} uri uri of component
 * @param {string} styles custom style
 * @returns {string} css scoped style
 */
function render(uri, styles) {
  return postcss([nested, simpleVars, csso]).process(`[data-uri="${uri}"] { ${styles} }`, { parser: safe })
    .then((result) => result.css);
}

module.exports.render = render;
