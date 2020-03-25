/**
 * Used only for post-build HTML beautification.
 */
module.exports = {
  posthtml: {
    plugins: {
      'posthtml-beautify': {
        mini: false,
        rules: {
          eof: false,
          useExistingLineBreaks: true,
          lowerAttributeName: false,
        },
      },
    },
  },
};
