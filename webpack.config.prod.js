/* eslint-disable @typescript-eslint/no-require-imports */
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const HTMLInlineCSSWebpackPlugin = require('html-inline-css-webpack-plugin').default;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const common = require('./webpack.config.common.js');

const IS_ANALYSIS = false;

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    concatenateModules: !IS_ANALYSIS,

    minimize: true,
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin({
        terserOptions: {
          toplevel: true, // 最高级别，删除无用代码
          ie8: false,
          safari10: true,
        },
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.(sass|scss)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          'css-loader',
          'resolve-url-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!.git'],
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[chunkhash:8].css',
      chunkFilename: '[id].css',
    }),
    new HTMLInlineCSSWebpackPlugin(),

    new webpack.DefinePlugin({}),

    IS_ANALYSIS && new BundleAnalyzerPlugin(),
  ].filter(Boolean),
});
