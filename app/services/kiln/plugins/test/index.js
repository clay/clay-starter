'use strict';

const props = ['inputs', 'modals', 'plugins', 'toolbarButtons', 'validators', 'transformers', 'navButtons', 'navContent'];

module.exports = () => {
  window.kiln = window.kiln || {}; // create global kiln if it doesn't exist

  props.forEach(prop => { // create global properties if they don't exist
    window.kiln[prop] = window.kiln[prop] || {};
  });

  window.kiln.navButtons['test'] = require('./nav-button.vue');
  window.kiln.navContent['test'] = require('./main.vue');
};
