'use strict';

const { NavButton, NavContent, Input, Modal } = require('pyxis-frontend');

module.exports = () => {
  window.kiln.navButtons['pyxis'] = NavButton;
  window.kiln.navContent['pyxis'] = NavContent;
  window.kiln.inputs['pyxis-picker'] = Input;
  window.kiln.modals['pyxis-picker'] = Modal;
};
