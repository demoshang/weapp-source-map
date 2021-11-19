/* eslint-disable @typescript-eslint/no-require-imports */
const glob = require('glob');
const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const WebpackCdnPlugin = require('webpack-cdn-plugin');
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const multiPages = glob.sync('./src/pages/**/*.html').map((filepath) => {
  const { dir } = path.parse(filepath);

  let config;
  try {
    config = require(path.resolve(dir, 'index.config.json'));
  } catch (e) {
    config = {};
  }

  return {
    dir,
    base: path.basename(dir),
    filepath,
    config,
  };
});

const multiEntry = Object.fromEntries(
  multiPages.map(({ base, dir }) => {
    return [base, [`${dir}/index.ts`]];
  }),
);

const multiHTMLPlugins = multiPages.map(({ config, base, dir }) => {
  return {
    title: config.title ?? '',
    filename: `${base}.html`, // Output
    template: `${dir}/index.html`, // Input
    chunks: [base],
  };
});

module.exports = {
  entry: multiEntry,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[chunkhash:8].js',
  },
  module: {
    rules: [
      {
        test: /\.js$|\.ts$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(pdf|gif|png|jpe?g|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'dist/static/[hash][ext][query]',
        },
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/fonts/[hash][ext][query]',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()],
    fallback: {
      fs: false,
    },
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './src/static/',
          to: './static/',
        },
      ],
    }),

    ...multiHTMLPlugins.map((v) => {
      return new HTMLWebpackPlugin(v);
    }),

    new HtmlWebpackTagsPlugin({
      append: false,
      links: [
        '//cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
        '//cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/font/bootstrap-icons.min.css',
      ],
      scripts: [],
    }),
    new WebpackCdnPlugin({
      prodUrl: '//cdn.jsdelivr.net/npm/:name@:version/dist/:path',
      prod: true,
      modules: [
        {
          name: 'clipboard',
          var: 'ClipboardJS',
          cdn: 'clipboard',
          path: 'clipboard.min.js',
        },
        {
          name: 'localforage',
          path: 'localforage.nopromises.min.js',
        },
        {
          name: 'source-map',
          var: 'sourceMap',
          path: 'source-map.js',
          prod: true,
        },
        {
          name: 'jszip',
          var: 'JSZip',
          cdn: 'jszip',
          path: 'jszip.min.js',
        },
      ],
      publicPath: '/node_modules',
    }),
  ],
  stats: {
    colors: true,
  },
  devtool: 'source-map',
};
