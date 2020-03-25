/* eslint-disable no-underscore-dangle */
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import assign from 'object-assign';

// https://atomiks.github.io/tippyjs/v5/getting-started/
// use v5 for `popper v1` compat, use `popper v1` for browser compat
function initTooltip(target, options = {}) {
  const defaultMethods = {
    onCreate(instance) {
      const closer = instance.popper.querySelector('.js-tippy-close');

      if (closer) {
        closer.addEventListener('click', () => instance.hide());
      }
    },
  };

  const defaults = {
    trigger: '',
    interactive: true,
    hideOnClick: false,
  };

  const finalOpts = assign({}, defaults, options);

  // don't overwrite methods
  Object.keys(defaultMethods).forEach((methodName) => {
    const originalMethod = finalOpts[methodName];

    if (typeof originalMethod === 'function') {
      finalOpts[methodName] = function (...args) {
        defaultMethods[methodName](...args);
        originalMethod(...args);
      };
    } else {
      finalOpts[methodName] = defaultMethods[methodName];
    }
  });

  return tippy(target, finalOpts);
}

document.addEventListener('keydown', (e) => {
  /* escape key */
  if (e.keyCode === 27) {
    document.querySelectorAll('.tippy-popper').forEach((el) => el._tippy.hide());
  }
});

export default initTooltip;
