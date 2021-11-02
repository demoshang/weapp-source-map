/* eslint-disable */
const HtmlWebpackPlugin = require('html-webpack-plugin');

// TODO: 扩展支持 eruda plugin
// 支持 eruda 参数
class ErudaPlugin {
  constructor(options = {}) {
    this.options = Object.assign(
      {
        force: false,
        // tool: [],
        // plugins: [],
      },
      options,
    );
  }

  apply(compiler) {
    const options = this.options;
    if (compiler.options.mode !== 'development' && !options.force) {
      return;
    }
    compiler.hooks.compilation.tap('ErudaPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tap('ErudaPlugin', (data) => {
        data.headTags.unshift({
          tagName: 'script',
          voidTag: false,
          meta: { plugin: 'html-webpack-plugin' },
          innerHTML: `eruda.init()`,
        });

        data.headTags.unshift({
          tagName: 'script',
          voidTag: false,
          meta: { plugin: 'html-webpack-plugin' },
          attributes: { src: '//cdn.bootcdn.net/ajax/libs/eruda/2.4.1/eruda.min.js' },
        });
      });
    });
  }
}

module.exports = ErudaPlugin;
