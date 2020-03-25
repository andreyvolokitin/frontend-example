function getInternetExplorerVersion() {
  let rv = -1;

  if (navigator.appName === 'Microsoft Internet Explorer') {
    const ua = navigator.userAgent;
    const re = new RegExp('MSIE ([0-9]{1,}[.0-9]{0,})');

    if (re.exec(ua) != null) {
      rv = parseFloat(RegExp.$1);
    }
  } else if (navigator.appName === 'Netscape') {
    const ua = navigator.userAgent;
    const re = new RegExp('Trident/.*rv:([0-9]{1,}[.0-9]{0,})');

    if (re.exec(ua) != null) {
      rv = parseFloat(RegExp.$1);
    }
  }
  return rv;
}

const $html = $('html');
const browser = {
  isOpera: window.opera && window.opera.buildNumber,
  isOperaMini: Object.prototype.toString.call(window.operamini) === '[object OperaMini]',
  isLtIE9: $html.hasClass('lt-ie9'),
  isIE9: $html.hasClass('ie9'),
  isIE10: $html.hasClass('ie10'),
  isIE11: getInternetExplorerVersion() === 11,
  isiOS: navigator.userAgent.match(/(iPad|iPhone|iPod)/g),
  isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
};

export default browser;
