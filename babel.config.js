module.exports = function (api) {
  api.cache(true);

  return {
    // https://www.zhouzh.tech/posts/7842fa90-e154-11eb-b0c2-b19c176da561
    presets: [
      [
        '@babel/preset-env',
        {
          targets: 'last 2 Chrome versions',
          useBuiltIns: 'usage',
          corejs: {
            version: 3,
            proposals: true,
          },
        },
      ],
      '@babel/preset-typescript',
    ],
    plugins: ['@babel/plugin-transform-runtime'],
  };
};
