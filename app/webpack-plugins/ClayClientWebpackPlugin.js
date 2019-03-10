class ClayClientPlugin {
  apply(compiler) {
    // console.log(Object.keys(compiler))
    // console.log('\n\n')
    // console.log(compiler.plugin)
    // compiler.hooks.thisCompilation.tap("jsonpScript", compilation => {
		// 	console.log(Object.keys(compilation))
		// 	console.log('\n\n')
		// 	console.log(compilation.mainTemplate)
		// });
    // console.log(compiler.inputFileSystem)
    // emit is asynchronous hook, tapping into it using tapAsync, you can use tapPromise/tap(synchronous) as well
    compiler.hooks.thisCompilation.tap('ClayClientPlugin', (compilation) => {
      console.log(Object.keys(compilation))
      console.log('\n\n\n')
      console.log(compilation.mainTemplate)
    });

    compiler.hooks.thisCompilation.tap('ClayClientPlugin', (compilation) => {
      // Create a header string for the generated file:
      // var filelist = '{';

      // console.log(Object.keys(compilation))
      // console.log('\n\n\n')
      // console.log(Object.keys(compilation.hooks))
      // console.log('\n\n\n')



      // console.log(compilation.assets)
      // Loop through all compiled assets,
      // adding a new line item for each filename.
      for (var filename in compilation.assets) {
        filelist += '- ' + filename + '\n';

        // console.log(singleFile(compilation.assets[filename]))
        console.log(compilation.assets)
      }

      // filelist += '}'

      // Insert this list into the webpack build as a new file asset:
      // compilation.assets['filelist.md'] = {
      //   source: function() {
      //     return filelist;
      //   },
      //   size: function() {
      //     return filelist.length;
      //   }
      // };


      // callback();
    });
  }
}

function singleFile(node) {
  console.log(node)


    // if (node._source.hasOwnProperty(prop)) {
    //   const element = node._source[prop];
    //   console.log(element)
    //   console.log('\n\n')

    // }

  console.log('\n\n\n')
}

module.exports = ClayClientPlugin;
