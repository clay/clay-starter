'use strict';

const path = require('path'),
  glob = require('glob'),
  ClayClientPlugin = require('./webpack-plugins/ClayClientWebpackPlugin'),
  entry = {
    '_client-init': './_client-init.js'
  };

glob.sync('./components/**/client.js').map(path => {
  const splitPath = path.split('/'),
    cmptName = splitPath[splitPath.length - 2];

  entry[`${cmptName}.client`] = path;
});



module.exports = {
  mode: 'development',
  entry,
  output: {
    // filename: '[name].client.js',
    filename: '[name].js',
    chunkFilename: '[name].js',
    path: path.resolve(__dirname, 'public', 'js'),
    // publicPath: '/js/'
  },
  optimization: {
    splitChunks: {
      chunks: 'initial',
      minChunks: 1,
      minSize: 1,
      name (module, chunks, cacheGroupKey) {
        const filename = module.resource.split('/').pop().split('.')[0];

        return `${filename}.dep.js`
      }
    }
  },
  resolve: {
    alias: {
      components: path.resolve(__dirname, 'components')
    }
  }
  , plugins: [new ClayClientPlugin({ options: true })]
}

// module.exports = {
//   mode: 'development',
//   entry: {
//     test: './test.js'
//   },
//   output: {
//     filename: '[name].js',
//     path: path.resolve(__dirname, 'foo')
//   },
//   optimization: {
//     minimizer: [new UglifyJsPlugin()],
//   },
// };
