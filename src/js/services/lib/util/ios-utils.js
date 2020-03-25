function getIOSWindowHeight() {
  const zoomLevel = document.documentElement.clientWidth / window.innerWidth;
  return window.innerHeight * zoomLevel;
}
function getHeightOfIOSToolbars() {
  const tH =
    (window.screen.orientation === 0 ? window.screen.height : window.screen.width) -
    getIOSWindowHeight();
  return tH > 1 ? tH : 0;
}

export { getIOSWindowHeight, getHeightOfIOSToolbars };
