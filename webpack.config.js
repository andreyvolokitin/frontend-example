require('dotenv').config();
require('core-js/stable');
require('regenerator-runtime/runtime');

const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');

const loadPresets = require('./build-utils/loadPresets');
// eslint-disable-next-line import/no-dynamic-require, global-require
const modeConfig = (mode) => require(`./build-utils/webpack.${mode}.js`)(mode);
const settings = require('./build-utils/settings');

const pageNames = [];
const ajaxPartialNames = [];
const ignorePagesAsEntries = ['404'];
const entries = {};

function getFiles(directoryPath) {
  let files;

  try {
    files = fs.readdirSync(directoryPath);
  } catch (err) {
    console.error(`Could not list the directory: ${directoryPath}`, err);
    process.exit(1);
  }

  return files;
}

function excludeNodeModulesExcept(modules) {
  let pathSep = path.sep;

  if (pathSep === '\\') {
    // must be quoted for use in a regexp:
    pathSep = '\\\\';
  }

  const moduleRegExps = modules.map((modName) => new RegExp(`node_modules${pathSep}${modName}`));

  return function (modulePath) {
    if (/node_modules/.test(modulePath)) {
      for (let i = 0; i < moduleRegExps.length; i += 1) {
        if (moduleRegExps[i].test(modulePath)) {
          return false;
        }
      }
      return true;
    }
    return false;
  };
}

function getAttributeValue(attributes, name) {
  const lowercasedAttributes = Object.keys(attributes).reduce((keys, k) => {
    // eslint-disable-next-line no-param-reassign
    keys[k.toLowerCase()] = k;

    return keys;
  }, {});

  return attributes[lowercasedAttributes[name.toLowerCase()]];
}

const srcFiles = getFiles(path.resolve(__dirname, settings.paths.src.base));
const ajaxPartials = getFiles(
  path.resolve(__dirname, settings.paths.src.base, settings.paths.src.ajax)
);
const entryFiles = getFiles(
  path.resolve(__dirname, settings.paths.src.base, settings.paths.src.pages)
);

srcFiles.forEach((file) => {
  const parsedPath = path.parse(file);

  if (parsedPath.ext === '.html' && !ignorePagesAsEntries.includes(parsedPath.name)) {
    pageNames.push(parsedPath.name);
  }
});

entryFiles.forEach((file, i) => {
  const parsedPath = path.parse(file);

  // pageNames.push(parsedPath.name);
  entries[parsedPath.name] = [
    `${settings.paths.src.js}/vendor/polyfills.js`,
    `${settings.paths.src.pages}/${parsedPath.name}.js`,
  ];
});

ajaxPartials.forEach((file) => {
  const parsedPath = path.parse(file);

  if (parsedPath.ext === '.html') {
    ajaxPartialNames.push(parsedPath.name);
  }
});

// "styles" entry name should be equal to the name of "css" cacheGroup, see #2 in the README.md
entries.styles = `${settings.paths.src.js}/styles.css.js`;

module.exports = ({ mode = 'production', presets = [], measure = false } = {}) => {
  const smp = new SpeedMeasurePlugin({
    disable: !measure,
  });

  return smp.wrap(
    webpackMerge(
      {
        // https://medium.com/webpack/webpack-4-mode-and-optimization-5423a6bc597a
        // https://webpack.js.org/configuration/
        mode,
        context: path.resolve(__dirname, settings.paths.src.base),
        entry: entries,
        output: {
          path: path.resolve(__dirname, settings.paths.dist.base),
        },
        resolve: {
          alias: {
            Assets: path.resolve(__dirname, settings.paths.src.base, settings.paths.src.assets),
            Css: path.resolve(__dirname, settings.paths.src.base, settings.paths.src.css),
            Js: path.resolve(__dirname, settings.paths.src.base, settings.paths.src.js),
            Vendor: path.resolve(
              __dirname,
              settings.paths.src.base,
              settings.paths.src.js,
              './vendor/'
            ),
            Modules: path.resolve(
              __dirname,
              settings.paths.src.base,
              settings.paths.src.js,
              './modules/'
            ),
            Behaviors: path.resolve(
              __dirname,
              settings.paths.src.base,
              settings.paths.src.js,
              './behaviors/'
            ),
            Services: path.resolve(
              __dirname,
              settings.paths.src.base,
              settings.paths.src.js,
              './services/'
            ),
            Utils: path.resolve(
              __dirname,
              settings.paths.src.base,
              settings.paths.src.js,
              './services/lib/util/'
            ),
            Components: path.resolve(
              __dirname,
              settings.paths.src.base,
              settings.paths.src.js,
              './services/lib/'
            ),
            modernizr$: path.resolve(__dirname, '.modernizrrc.js'),
          },
        },
        module: {
          rules: [
            {
              test: /\.js$/,
              // https://github.com/babel/babel-loader/issues/171
              // https://github.com/webpack/webpack/issues/2031#issuecomment-317589620
              // exclude: [excludeNodeModulesExcept([]), /vendor/],
              exclude: /(node_modules|vendor)/,
              use: ['babel-loader', 'eslint-loader'],
            },
            {
              test: /\.html$/,
              use: [
                {
                  // consider using updated `html-loader`: https://github.com/webpack-contrib/html-loader
                  // note: currently it hangs the build

                  // https://stackoverflow.com/questions/51801338/webpack-html-loader-not-resolving-srcset-images/51804992#comment98072800_51804992
                  loader: 'html-loader-srcset',
                  options: {
                    attrs: [
                      ':srcset',
                      'img:src',
                      'audio:src',
                      'video:src',
                      'track:src',
                      'embed:src',
                      'source:src',
                      'input:src',
                      'object:data',

                      'img:data-src',
                      ':data-srcset',
                      ':href',
                      ':style',
                      ':data-lazy',
                      ':data-img',
                    ],
                  },
                },
                'posthtml-loader',
              ],
            },
            {
              test: /\.(png|jpg|jpeg|gif|ttf|eot|woff|woff2)$/,
              use: [
                {
                  loader: 'url-loader',
                  options: {
                    limit: false,
                    // limit: 5 * 1024,
                    name: '[name].[hash:8].[ext]',
                    outputPath(url) {
                      const p = /\.(ttf|eot|woff|woff2)$/.test(url)
                        ? path.normalize(settings.paths.dist.fonts)
                        : path.normalize(settings.paths.dist.img);

                      return path.join(p, url);
                    },
                    esModule: false, // https://github.com/webpack-contrib/url-loader/issues/205
                  },
                },
              ],
            },
            {
              test: /\.svg$/,
              loader: 'svg-url-loader',
              options: {
                limit: 1,
                // limit: 5 * 1024,
                // Remove quotes around the encoded URL –
                // they’re rarely useful
                noquotes: true,
                name: '[name].[hash:8].[ext]',
                outputPath: path.normalize(settings.paths.dist.img),
              },
            },
            {
              test: /\.modernizrrc\.js$/,
              use: [
                {
                  loader: 'expose-loader',
                  options: 'Modernizr',
                },
                {
                  loader: 'webpack-modernizr-loader',
                },
              ],
            },
            {
              test: require.resolve('jquery'),
              use: [
                {
                  loader: 'expose-loader',
                  options: 'jQuery',
                },
                {
                  loader: 'expose-loader',
                  options: '$',
                },
              ],
            },
          ],
        },
        plugins: [
          new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            Modernizr: 'modernizr',
          }),
          ...pageNames.map(
            (name) =>
              new HtmlWebpackPlugin({
                filename: `${name}.html`,
                template: `./${name}.html`,
                chunks: ['runtime', 'vendor', 'commons', name, 'styles'],
                minify: false,
              })
          ),
          ...ajaxPartialNames.map(
            (name) =>
              new HtmlWebpackPlugin({
                filename: `${settings.paths.dist.ajax}/${name}.html`,
                template: `${settings.paths.src.ajax}/${name}.html`,
                inject: false,
                minify: false,
              })
          ),
        ],
        optimization: {
          // for slimmer chunks:
          // - use dynamic code splitting
          // - deprecate a concept of 'vendor' chunk
          splitChunks: {
            cacheGroups: {
              css: {
                test: /\.(css|scss)$/,
                // name should be equal to the name of css-only webpack entry, see #1 in the README.md
                name: 'styles',
                chunks: 'all',
                minChunks: 1,
              },
              commons: {
                name: 'commons',
                chunks: 'initial',
                minChunks: 2,
              },
              vendors: {
                test: /([\\/](node_modules|vendor)[\\/]|\.modernizrrc.js$)/,
                name: 'vendor',
                chunks: 'initial',
              },
            },
          },
          // consider inlining runtime chunk into html
          runtimeChunk: 'single',
        },
      },
      webpackMerge.strategy({
        'module.rules': 'replace',
      })(modeConfig(mode), loadPresets({ mode, presets }))
    )
  );
};
