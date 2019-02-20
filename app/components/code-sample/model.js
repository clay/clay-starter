'use strict';

module.exports.save = (uri, data) => {
    console.log('\n\n\nFROM SAVE');
    console.log('This is the uri ', uri);
    console.log('this is the data ', JSON.stringify(data, null, 4));

    var Prism = require('prismjs');

    // The code snippet you want to highlight, as a string
    var code = "var data = 1;";
    
    // Returns a highlighted HTML string
    //use data.language
    var html = Prism.highlight(data.code, Prism.languages.css, 'javascript');

    data.html = html 

    return data;
}

module.exports.render = (uri, data) => {
    console.log('\n\n\nFROM RENDER');
    console.log('This is the uri ', uri);
    console.log('this is the data ', JSON.stringify(data, null, 4));

    return Promise.resolve(data);
}