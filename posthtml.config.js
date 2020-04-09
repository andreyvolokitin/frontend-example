const path = require('path');
const settings = require('./build-utils/settings');

const assetsSrc = path.normalize(settings.paths.src.assets);

module.exports = ({ file, options, env }) => ({
  plugins: [
    require('posthtml-include')(),
    require('posthtml-extend')({
      root: 'src',
    }),
    require('posthtml-expressions')({
      locals: {
        text: 'default text',
        type: 'submit',
        tag: 'div',
        Test: 'test1',
        test: 'test2',
        testAttr: 'test3',
        testVal: 'test4',
        btnAttrs: 'data-num=1 disabled data-txt="txt=text" data-attr="attr"',
        mytag: 'div',
        myscope: {
          text: 'Text',
          type: 'button',
          tag: 'a',
          btnAttrs: 'data-num="2" data-txt="test=test" data-attr=text',
        },
      },
    }),

    // Replace URLs inside inline styles
    require('posthtml-postcss')(
      [
        require('postcss-urlrewrite')({
          rules: [
            {
              from: new RegExp(`^(./)?${assetsSrc}/.+`),
              to(match, p1, offset, fullString) {
                if (
                  path.basename(file.dirname) ===
                  path.basename(path.normalize(settings.paths.src.ajax))
                ) {
                  return `${path
                    .normalize(settings.paths.src.ajax)
                    .split(path.sep)
                    .reduce((accumulator, val) => {
                      return /\w+/.test(val) ? `${accumulator}../` : accumulator;
                    }, '')}${match}`;
                }

                return fullString;
              },
            },
          ],
        }),
      ],
      { from: undefined },
      /^text\/css$/
    ),
    require('posthtml-urls')({
      eachURL: url => {
        if (
          path.basename(file.dirname) === path.basename(path.normalize(settings.paths.src.ajax))
        ) {
          return url.replace(
            new RegExp(`^(./)?${assetsSrc}/.+`),
            `${path
              .normalize(settings.paths.src.ajax)
              .split(path.sep)
              .reduce((accumulator, val) => {
                return /\w+/.test(val) ? `${accumulator}../` : accumulator;
              }, '')}$&`
          );
        }

        return url;
      },
    }),
  ],
});
