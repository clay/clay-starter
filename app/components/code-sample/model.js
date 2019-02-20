'use strict';

module.exports.save = (uri, data) => {
    console.log('\n\n\nFROM SAVE');
    console.log('This is the uri ', uri);
    console.log('this is the data ', JSON.stringify(data, null, 4));

    var Prism = require('prismjs');
  
    // Returns a highlighted HTML string
    data.html = Prism.highlight(data.code, Prism.languages[data.language], data.language); 

    return data;
}

module.exports.render = (uri, data) => {
    console.log('\n\n\nFROM RENDER');
    console.log('This is the uri ', uri);
    console.log('this is the data ', JSON.stringify(data, null, 4));

    return Promise.resolve(data);
}