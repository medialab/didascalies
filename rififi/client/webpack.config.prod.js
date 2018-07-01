/**
 * Webpack configuration for handling the applicatino's source code
 * in production mode (standard + minify)
 */
var webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const config = require('config')
const urlPrefix = config.get('urlPrefix');

var sharedConfig = require('./webpack.config.shared');
module.exports = {

  module: sharedConfig.module,

  plugins: sharedConfig.plugins
    .concat(new UglifyJsPlugin())
    .concat(new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })),

    output: {
      path: "/build",
      publicPath: urlPrefix && urlPrefix.length ? urlPrefix + "/build/" : '/build/'
    }
};