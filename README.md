# frontend-example

The package shows an example of my frontend code.

## Getting started

Project requires [node >=10.13.0](https://nodejs.org/en/) to be installed on your computer. 

Download repository, install project dependencies running `npm i` in the command line inside the root folder. Then you can: 
- `npm run start` to start project in dev mode; 
- `npm run build` to build a project in production mode;
- read ahead for full description of npm scripts.

## npm scripts

There are some npm scripts for developing, building, debugging and other tasks.

### `npm run start`

Starts the project in development mode with [webpack-dev-server](https://webpack.js.org/configuration/dev-server/). 
The HTML and JS are "live-reloaded" on file save (JS can use [hot module replacement](https://webpack.js.org/guides/hot-module-replacement/) if needed).
CSS is updated without page refresh on file save.

### `npm run start:sourcemap`

Same as `npm run start`, but with full sourcemap support instead of `'eval-cheap-module-source-map'`. 
It can make rebuilds slower. For details see: https://webpack.js.org/configuration/devtool/

### `npm run start:measure`

Same as `npm run start`, but measures aspects of the (re)build with [speed-measure-webpack-plugin](https://github.com/stephencookdev/speed-measure-webpack-plugin). Currently throws on rebuild, see: https://github.com/stephencookdev/speed-measure-webpack-plugin/issues/118

### `npm run clean`

Deletes folder with built project

### `npm run build`

Build project in production mode.

### `npm run build:analyze`

Same as `npm run build`, but also analyzing final build with [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)

### `npm run build:compress`

Same as `npm run build`, but also compressing files [compression-webpack-plugin](https://webpack.js.org/plugins/compression-webpack-plugin/)

### `npm run build:measure`

Same as `npm run build`, but measures aspects of the build with [speed-measure-webpack-plugin](https://github.com/stephencookdev/speed-measure-webpack-plugin)

### `npm run debug`
Debug webpack node process, see: https://nodejs.org/en/docs/guides/debugging-getting-started/

### `npm run debug:dev`
Same as `npm run debug`, but for development build

### `npm run debug:prod`
Same as `npm run debug`, but for production build

### `npm run watch`

Run development build, watch for further code changes

### `npm run lint:css`

Lint source CSS using `stylelint` with [--fix](https://stylelint.io/user-guide/usage/options#fix)

### `npm run lint:js`

Lint source JS using `eslint` with [--fix](https://eslint.org/docs/2.13.1/user-guide/command-line-interface#options)

### `npm run prettydist:html`
Make built HTML pretty with `postheml-beautify` (mainly fix uglyness created with `posthtml`)

### `npm run prettydist:css`
Make built CSS pretty with `stylelint`

### `npm run prettydist:js`
Make built JS pretty with `prettier`

### `npm run prettydist`

Make built CSS anf HTML pretty.

## Structure

All configuration files are contained in the project root. Other folders are:

- `./build-utils`: webpack build utilities and presets, see [Configuration section](##Configuration) for further details
- `./src`: source code for the project
- `./dist`: location of the final build

##HTML

Main HTML located in `./src`. `./src/ajax` contains HTML chunks which are loaded with JS during runtime.
Project uses [PostHTML](https://github.com/posthtml/posthtml) for HTML includes, expressions, extends and some URL rewriting (you can see specific plugins in `posthtml.config.js`). 
`./src/partials` contains HTML includes (`./src/includes` and `./src/templates`) and extendable HTML pieces, if any (`./src/layouts`).
After production build emitted HTML is processed with `posthtml-beautify` to fix uglyness created with PostHTML, see `posthtml-cli.config.js`

## CSS

CSS is located in `./src/css` folder. For CSS processing project uses [SCSS](https://sass-lang.com/) and [PostCSS](https://postcss.org/). 
The CSS structure is based on [the 7-1 pattern](https://sass-guidelin.es/#the-7-1-pattern), see link for details.
The `vendor.scss` is separated to allow inclusion prior project CSS.
CSS is imported in separate webpack entry, located at `./src/js/styles.css.js`

For the PostCSS config see `postcss.config.js`.

Also see `./src/css/README.md`.


## JavaScript

JavaScript is located in `./src/js` folder. The main structure is based on [T3 framework](http://t3js.org/), which describes `behaviors`, `modules` and `services` folders.
Most "services" are written as simple ES modules. Sometimes they need to be actual T3-services (to allow access to internal T3 APIs), these modules are marked with `.t3` suffix in the filename, i.e. `store.t3.js`.
In short: the HTML refers to "modules" via `data-module` attribute. "Modules" describe application logic, "behaviors" make this logic reusable in multiple modules, and all other code is "services".

Each HTML page has its own webpack entry with equal filename, located in `./src/js/pages`. This entry includes all modules used on a page, as well as page initialization.

`./src/js/vendor` folder contains code which is not included via NPM (avoid it), and also a file with polyfills, inline or imported from NPM (prefer imported).

Also see `./src/js/README.md`.

## Component library

A lot of reusable CSS and JS code is written as component library to be abstracted into separate package.
As for now CSS for component library reside in `./src/css/components` together with project-specific components.
The abstract JS components are separated into `./src/js/services/lib`


## Assets

All project assets are located in the `./assets` folder. Webpack processes all assets and rewrites their filenames for cahce busting (see https://webpack.js.org/guides/caching/). 
Production build generates a `manifest.json` file (using [webpack-assets-manifest](https://github.com/webdeveric/webpack-assets-manifest)) inside a `./dist` folder, containing the list of all relevant file paths and 
their respective hashed paths, to allow a server to refer to a proper files generated by webpack build 


## Documentation

Generic source code documentation is located in `./src/doc`, i.e. [h5bp](https://html5boilerplate.com/) and [normalize.css](https://necolas.github.io/normalize.css/). 
Main docs for project is located in `./src/README.md`. Docs for CSS/JS are located in specific CSS/JS folders, if necessary, and, mainly, inside the code itself.

## Testing

There is currently no testing setup.

##Configuration

Configuration files are located in the project root

### Browser support

Project uses [browserlist](https://github.com/browserslist/browserslist) to define supported browsers, see `.browserslistrc`.

### Code linting

The basic code style is define in `.editorconfig`, make sure your IDE or code editor supports it. See: https://editorconfig.org/.

Then there is linting for CSS and JS with [stylelint](https://stylelint.io/) and [ESlint](https://eslint.org/) ([airbnb style guide](https://github.com/airbnb/javascript/)). 
See `stylelint.config.js` and `.eslintrc.js` for details.
You can also ignore specific CSS files for stylelint with `.stylelintignore`.

[Prettier](https://prettier.io/) is used to make code looks consistent, see `.prettierrc`.

### Code processing

JavaScript is processed with [Babel](https://babeljs.io/), but usage of newest language features should remain conservative to [avoid bloat the final build](https://medium.com/@WebReflection/avoiding-babels-production-bloat-d53eea2e1cbf). See `babel.config.js`.

CSS is processed with [PostCSS](https://postcss.org/) (after it gets transpiled from [SCSS](https://sass-lang.com/)), see `postcss.config.js`.

HTML is processed with [PostHTML](https://github.com/posthtml/posthtml), see `posthtml.config.js`, `posthtml-cli.config.js`, and [HTML section](##HTML) for details.

### Environment variables

The project [environment variables](https://en.wikipedia.org/wiki/Environment_variable) are defined in `.env`. For it only defines IP and port for a development server, but can potentially be used for other purposes.

### Webpack configuration

First, some links: 

- https://webpack.js.org/configuration/
- https://survivejs.com/webpack/foreword/
- https://medium.com/webpack/webpack-4-mode-and-optimization-5423a6bc597a (note that `webpack 5` is around the corner)

Webpack is configured via multiple composed configs (base, development and production) and optional presets, see https://github.com/survivejs/webpack-merge.
Base config is located in `webpack.config.js`.  Development and production config, as well as presets, are located in `./build-utils` folder, see `./build-utils/webpack.development.js`, `./build-utils/webpack.development.js` and `./build-utils/presets`.
The file with shared settings (mainly file paths) is also used by differend webpack configs, see `./build-utils/settings.js`.

Presets are modular features which gets merged into final webpack config as needed via npm scripts and `env` variable, see https://frontendmasters.com/courses/webpack-fundamentals/implementing-presets/.
With a help of `./build-utils/loadPresets.js` utility (which is used in a base webpack config) we can write modular presets inside `./build-utils/presets` with a following file format: `webpack.presetname.js`. 
Then we can use them in npm scripts as follows: `"build:analyze": "npm run build -- --env.presets analyze"`. `-- --env.presets analyze` appends arguments to the `build` script, so we can add functionality to the basic `build` task, and eventually get `./build-utils/presets/webpack.analyze.js` merged into the final config.

### Modernizr

Project uses [Modernizr](https://modernizr.com/) and [webpack-modernizr-loader](https://github.com/itgalaxy/webpack-modernizr-loader) to easily bundle modernizr with webpack. 
`.modernizrrc.js` contains config for required modernizr features, which can be obtained at https://modernizr.com/download: clicking "build" button gets you a Command Line Config. 

### git

See `.gitattributes` and `.gitignore`.

## Misc details

    
1. `MiniCssExtractPlugin` emits empty js chunk into the build, see links:

    - https://github.com/webpack-contrib/mini-css-extract-plugin/issues/151
    - https://github.com/webpack/webpack/issues/7300
    
    To remove this empty js chunk we need to create a separate webpack entry which includes project css,
    and name it the same as the "css" cacheGroup (i.e. "styles"). `MiniCssExtractPlugin` will extract
    all css from this entry and leave an "empty" js file, which will be picked up and eliminated by
    `FixStyleOnlyEntriesPlugin`. 
    
    Note that without this hack we could include project css wherever we like
    (i.e. in the "page" behavior), from where it would be extracted as well, but in that case 
    `FixStyleOnlyEntriesPlugin` wouldn't work, because it needs webpack entry which contains only css.
    
    All these hacks will be unnecessary in webpack 5 where this bug is fixed.

1. `.js` files can import modules with paths starting with aliases, (`import 'Alias/module';`). 
Aliases are described in `resolve.alias` section of `webpack.config.js`, they are started with the 
upper-case letter and this is how they can be identified in the code. To make their use more convenient 
consider setting up your code editor/IDE to automatically recognize webpack aliases. 
*NOTE: the project currently DOES NOT use aliases because of buggy IDE support. The aliases settings
are still present in the config for potential use.*
