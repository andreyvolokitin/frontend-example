// eslint-disable-next-line import/no-extraneous-dependencies
const webpackMerge = require('webpack-merge');

module.exports = (env) => {
  const { presets } = env;
  const mergedPresets = [].concat(...[presets]);
  const mergedConfigs = mergedPresets.map(
    // eslint-disable-next-line import/no-dynamic-require, global-require
    (presetName) => require(`./presets/webpack.${presetName}.js`)(env)
  );

  return webpackMerge({}, ...mergedConfigs);
};
