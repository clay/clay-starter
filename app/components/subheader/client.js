'use strict';

/**
 * initialization function for subheader link icon comments
 * @param  {Element} el
 */
module.exports = element => {
  element.addEventListener('click', event => {
    console.log('::ELEMENT', element);
    console.log('::EVENT', event);
  });
};
