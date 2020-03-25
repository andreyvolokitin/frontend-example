module.exports = {
  // "minify": true,
  "options": [
    "domPrefixes",
    "prefixes",
    "testAllProps",
    "testProp",
    "testStyles",
    "setClasses"
  ],
  "feature-detects": [
    "test/touchevents",
    "test/css/columns",
    "test/css/flexbox",
    "test/css/flexwrap",
    "test/css/pointerevents",
    "test/css/transforms",
    "test/css/transforms3d",
    "test/css/transitions",
    "test/css/overflow-scrolling"
  ]
};
