const isRetina = (function isRetina(w) {
  if (w.devicePixelRatio >= 1.5) {
    return true;
  }

  return (
    w.matchMedia &&
    w.matchMedia(
      '(-webkit-min-device-pixel-ratio:1.5),(min--moz-device-pixel-ratio:1.5),(-o-min-device-pixel-ratio:3/2),(min-resolution:1.5dppx)'
    ).matches
  );
})(window);

export default isRetina;
