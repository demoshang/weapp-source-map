/* eslint-disable @typescript-eslint/no-require-imports */
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.config.common.js');
// const ErudaPlugin = require('./tools/eruda-webpack-plugin.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  target: 'web',
  devServer: {
    hot: true,
    open: false,
    port: process.env.PORT || 9000,
    host: process.env.HOST || 'localhost',
    historyApiFallback: true,
    allowedHosts: 'all',
  },
  module: {
    rules: [
      {
        test: /\.(sass|scss)$/,
        use: ['style-loader', 'css-loader', 'resolve-url-loader', 'postcss-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      DOMAIN: 'http://localhost',
    }),
    // new ErudaPlugin({ force: true }),
  ],
});
