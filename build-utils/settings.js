module.exports = {
  // When using these paths in webpack config, only use them with Node.js `path` module to allow cross-platform compatibility.
  // Paths are relative to the 'base' key, 'base' path is relative to the project root.
  // Do not use trailing slash (/).
  paths: {
    src: {
      base: './src',
      css: './css',
      js: './js',
      pages: './js/pages',
      assets: './assets',
      img: './assets/img',
      fonts: './assets/fonts',
      ajax: './ajax',
    },
    dist: {
      base: './dist',
      css: './css',
      js: './js',
      assets: './assets',
      img: './assets/img',
      fonts: './assets/fonts',
      ajax: './ajax',
    },
  },
};
