'use strict';

const props = ['inputs', 'modals', 'plugins', 'toolbarButtons', 'validators', 'transformers'];

module.exports = () => {
  window.kiln = window.kiln || {}; // create global kiln if it doesn't exist
  window.kiln.plugins = window.kiln.plugins || {}; // create global vuex plugins if they don't exist
  window.kiln.validators = window.kiln.validators || {}; // create global validators if they don't exist
  window.kiln.transformers = window.kiln.transformers || {}; // create global transformers if they don't exist
  window.kiln.navButtons = window.kiln.navButtons || {};
  window.kiln.navContent = window.kiln.navContent || {};
  window.kiln.helpers = require('../universal/helpers');

  props.forEach(prop => { // create global properties if they don't exist
    window.kiln[prop] = window.kiln[prop] || {};
  });

  require('fastly-clear-plugin');
  require('./plugins/word-count')();
};
