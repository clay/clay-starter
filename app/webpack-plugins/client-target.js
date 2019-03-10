window.modules["tags.client"] = [function(require,module,exports){'use strict';

module.exports = function (el) {
  var moreButton = el.querySelector('.more');

  if (moreButton) {
    moreButton.addEventListener('click', function (e) {
      var button = e.target,
          hiddenTags = el.querySelectorAll('li.hidden');
      hiddenTags.forEach(function (hiddenTag) {
        hiddenTag.classList.remove('hidden');
      });
      button.parentNode.removeChild(button);
      e.preventDefault();
    });
  }
};
}, {}];
