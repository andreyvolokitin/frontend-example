/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const settings = require('./build-utils/settings');

const assetsSrc = path.normalize(settings.paths.src.assets);

// eslint-disable-next-line no-unused-vars
module.exports = ({ file, options, env }) => ({
  plugins: {
    // URLs in CSS are relative to the project source folder (src).
    // This plugin rewrites sourceFolder-relative URLs to be file-relative and actually resolvable
    'postcss-urlrewrite': {
      rules: [
        {
          from: new RegExp(`^(./)?${assetsSrc}/.+`),
          to: `${path
            .normalize(settings.paths.src.css)
            .split(path.sep)
            .reduce((accumulator, val) => {
              return /\w+/.test(val) ? `${accumulator}../` : accumulator;
            }, '')}$&`,
        },
      ],
    },
    'postcss-mixins': {}, // for additional js-powered mixins: https://github.com/postcss/postcss-mixins#function-mixin
    'postcss-easysprites': {},
    'postcss-inline-svg': {},
    autoprefixer: {},
    'postcss-at2x': {
      detectImageSize: true,
      resolveImagePath(url) {
        return path.resolve(settings.paths.src.base, settings.paths.src.css, url);
      },
    },

    // 'postcss-sprites': {},
    // 'postcss-data-packer': {},
    // 'postcss-easings': {},
    // 'postcss-flexbugs-fixes': {},
    // 'postcss-url': {},

    // https://stackoverflow.com/a/22262489/718630
    // https://adamwathan.me/dont-use-em-for-media-queries/
    'postcss-em-media-query': {},
    'postcss-reporter': {},

    // To consider:
    // Image handling: https://css-tricks.com/images-in-postcss/
    // URL rewrite: postcss-url-mapper
    // Assets managing: postcss-assets
    // inline parts of SVG sprites with attributes control: https://github.com/pavliko/postcss-svg
    // inline  SVG files with attributes control: https://github.com/TrySound/postcss-inline-svg
  },
});
