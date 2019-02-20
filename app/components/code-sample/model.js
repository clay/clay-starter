'use strict';

module.exports.save = (uri, data) => {
    debugger
    var Prism = require('prismjs');
  
    data.code = data.code.replace(/\t/g, '  ');
    
    // Returns a highlighted HTML string
    data.html = Prism.highlight(data.code, Prism.languages[data.language], data.language); 

    return data;
}