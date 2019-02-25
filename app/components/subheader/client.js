'use strict';

/**
 * initialization function for subheader link icon comments
 * @param  {Element} el
 */
module.exports = element => {
  element.addEventListener('mouseover', event => {
    event.currentTarget.classList.add('link-show');
  });

  element.addEventListener('mouseout', event => {
    event.currentTarget.classList.remove('link-show');
  });
};
