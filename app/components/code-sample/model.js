'use strict';
const Prism = require('prismjs');

require('prismjs/components/prism-yaml');

module.exports.save = (uri, data) => {
  // added manual spaces, klin codemirror don't recognize tab spaces
  data.code = data.code.replace(/\t/g, '  ');

  // Returns a highlighted HTML string
  data.html = Prism.highlight(data.code, Prism.languages[data.language], data.language);

  return data;
};
