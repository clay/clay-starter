'use strict';

module.exports = el => {
  const moreButton = el.querySelector('.more');

  if (moreButton) {
    moreButton.addEventListener(
      'click',
      (e) => {
        const button = e.target,
          hiddenTags = el.querySelectorAll('li.hidden');

        hiddenTags.forEach(function (hiddenTag) {
          hiddenTag.classList.remove('hidden');
        });
        button.parentNode.removeChild(button);
        e.preventDefault();
      }
    );
  }
};
