// this.hooks.require.tap("MainTemplate", (source, chunk, hash) => {

class ClayClientPlugin {
  apply(compiler) {
    compiler.hooks.afterCompile.tap("ClayClientPlugin", (compilation) => {
      // console.log(Object.keys(compilation.mainTemplate.hooks))
      console.log(Object.keys(compilation.moduleTemplates))
      // console.log(compilation)

      // compilation.moduleTemplates.javascript.hooks.package.tap("ClayClientPlugin", (source) => {
      //   console.log(source)
      //   console.log('\n\n\n')
      //   return source;
      // })


      // compilation.mainTemplate.hooks.jsonpScript.tap("ClayClientPlugin", (source, chunk, hash) => {
      //   console.log(chunk)
      //   console.log('\n\n\n')
      //   return 'hi';
      // })
    })
    // compiler.hooks.emit.tapAsync('ClayClientPlugin', (compilation, callback) => {
    //   var filelist = '{';
    //   // console.log(Object.keys(compilation))
    //   // console.log('\n\n\n\n')
    //   // console.log(compilation.modules)

    //   for (var filename in compilation.assets) {
    //     filelist += '- ' + filename + '\n';

    //     singleFile(compilation.assets[filename])
    //     // console.log(compilation.assets)
    //   }

    //   filelist += '}'

    //   // Insert this list into the webpack build as a new file asset:
    //   // compilation.assets['filelist.md'] = {
    //   //   source: function() {
    //   //     return filelist;
    //   //   },
    //   //   size: function() {
    //   //     return filelist.length;
    //   //   }
    //   // };


    //   callback();
    // });
  }
}

function singleFile(node) {
  console.log(node._source)


    // if (node._source.hasOwnProperty(prop)) {
    //   const element = node._source[prop];
    //   console.log(element)
    //   console.log('\n\n')

    // }

  console.log('\n\n\n')
}

module.exports = ClayClientPlugin;
