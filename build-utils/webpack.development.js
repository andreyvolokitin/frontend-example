/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const settings = require('./settings');

const jsDist = path.normalize(settings.paths.dist.js);

// eslint-disable-next-line no-unused-vars
module.exports = (env) => ({
  output: {
    filename: `${jsDist}/[name].bundle.js`,
    chunkFilename: `${jsDist}/[name].chunk.js`,
  },
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
            },
          },
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'fast-sass-loader',
            options: {
              resolveURLs: false,
            },
          },
        ],
      },
    ],
  },
  devtool: 'eval-cheap-module-source-map',
  // https://webpack.js.org/configuration/dev-server/
  // https://survivejs.com/webpack/developing/webpack-dev-server/
  devServer: {
    contentBase: path.resolve(settings.paths.src.base),
    hot: true,
    before(app, server) {
      // eslint-disable-next-line no-underscore-dangle
      server._watch(`${settings.paths.src.base}/**/*.html`);
    },
    stats: 'errors-only',
    clientLogLevel: 'error',
    overlay: true,
    host: process.env.DEVSERVER_HOST || '0.0.0.0',
    port: process.env.DEVSERVER_PORT || 8080,
  },
});
