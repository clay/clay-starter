'use strict';

const props = ['inputs', 'modals', 'plugins', 'toolbarButtons', 'validators', 'transformers'];

module.exports = () => {
  window.kiln = window.kiln || {}; // create global kiln if it doesn't exist
  window.kiln.helpers = require('../universal/helpers');
  window.kiln.plugins = window.kiln.plugins || {};
  window.kiln.navButtons = window.kiln.navButtons || {};
  window.kiln.navContent = window.kiln.navContent || {};

  props.forEach(prop => {
    // create global properties if they don't exist
    window.kiln[prop] = window.kiln[prop] || {};
  });

  require('./plugins/pyxis')();
  require('./plugins/word-count')();
};
