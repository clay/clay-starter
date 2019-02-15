'use strict';

var wordCount = require('../../universal/word-count');

/**
 * update word count element after vue's current tick
 * @param  {number} count
 */
function updateWordCount(count) {
  window.setTimeout(() => {
    var wordCountEl = document.querySelector('.word-count');

    if (wordCountEl) {
      wordCountEl.innerHTML = 'Words: ' + count;
    }
  }, 0);
}

module.exports = () => {
  window.kiln.plugins['word-count'] = function (store) {
    // update word count whenever a paragraph, blockquote, article, etc is re-rendered
    store.subscribe(function (mutation, state) {
      var uri = mutation.payload && mutation.payload.uri;

      if (mutation.type === 'PRELOAD_SUCCESS' || mutation.type === 'RENDER_COMPONENT' && wordCount.isComponentWithWords(uri)) {
        updateWordCount(wordCount.count(state.components));
      }
    });
  };
};
