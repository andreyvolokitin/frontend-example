/**
 * MBP - Mobile boilerplate helper functions
 */

/**
 * Normalized hide address bar for iOS & Android
 * (c) Scott Jehl, scottjehl.com
 * MIT License
 */

// If we split this up into two functions we can reuse
// this function if we aren't doing full page reloads.

// If we cache this we don't need to re-calibrate everytime we call
// the hide url bar
let BODY_SCROLL_TOP = false;

// So we don't redefine this function everytime we
// we call hideUrlBar
function getScrollTop() {
  return (
    window.pageYOffset ||
    (document.compatMode === 'CSS1Compat' && document.documentElement.scrollTop) ||
    document.body.scrollTop ||
    0
  );
}

// It should be up to the mobile
function hideUrlBar() {
  // if there is a hash, or BODY_SCROLL_TOP hasn't been set yet, wait till that happens
  if (!window.location.hash && BODY_SCROLL_TOP !== false) {
    window.scrollTo(0, BODY_SCROLL_TOP === 1 ? 0 : 1);
  }
}

function hideUrlBarOnLoad() {
  let bodycheck;

  // If there's a hash, or addEventListener is undefined, stop here
  if (!window.navigator.standalone && !window.location.hash && window.addEventListener) {
    // scroll to 1
    window.scrollTo(0, 1);
    BODY_SCROLL_TOP = 1;

    // reset to 0 on bodyready, if needed
    bodycheck = setInterval(() => {
      if (document.body) {
        clearInterval(bodycheck);
        BODY_SCROLL_TOP = getScrollTop();
        hideUrlBar();
      }
    }, 15);

    window.addEventListener(
      'load',
      () => {
        setTimeout(() => {
          // at load, if user hasn't scrolled more than 20 or so...
          if (getScrollTop() < 20) {
            // reset to hide addr bar at onload
            hideUrlBar();
          }
        }, 0);
      },
      false
    );
  }
}

/**
 * Autogrow
 * http://googlecode.blogspot.com/2009/07/gmail-for-mobile-html5-series.html
 */
function textareaAutogrow(elements) {
  elements.forEach((element) => {
    const setLineHeight = parseInt($(element).css('lineHeight'), 10);
    let textLineHeight = element.currentStyle
      ? element.currentStyle.lineHeight
      : getComputedStyle(element, null).lineHeight;

    textLineHeight =
      textLineHeight.indexOf('px') === -1 ? setLineHeight : parseInt(textLineHeight, 10);

    function handler() {
      const $that = $(this);
      const newHeight = this.scrollHeight;
      const currentHeight = this.clientHeight;
      if (newHeight > currentHeight) {
        this.style.height = `${newHeight + 3 * textLineHeight}px`;
        $that.trigger('content-update').focus();
      }
    }

    // eslint-disable-next-line no-param-reassign
    element.style.overflow = 'hidden';

    if (element.addEventListener) {
      element.addEventListener('input', handler, false);
    } else {
      element.attachEvent('onpropertychange', handler);
    }
  });
}

/**
 * Enable CSS active pseudo styles in Mobile Safari
 * http://alxgbsn.co.uk/2011/10/17/enable-css-active-pseudo-styles-in-mobile-safari/
 */

function enableIOSActive() {
  document.addEventListener('touchstart', () => {}, false);
}

export { hideUrlBarOnLoad, enableIOSActive, textareaAutogrow };
