// 2.9kb alternative: https://github.com/taylorhakes/promise-polyfill
// Promise.allSettled currently not supported: https://github.com/stefanpenner/es6-promise/issues/354
import 'es6-promise/auto';
// https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill
// https://github.com/kumarharsh/custom-event-polyfill/issues/4
import 'custom-event-polyfill';
import 'element-closest/browser';

// https://github.com/robhicks/es2015-Promise.allSettled
if (Promise && !Promise.allSettled) {
  Promise.allSettled = function(promises) {
    return Promise.all(
      promises.map(function(promise) {
        return promise
          .then(function(value) {
            return {
              state: 'fulfilled',
              value: value,
            };
          })
          .catch(function(reason) {
            return {
              state: 'rejected',
              reason: reason,
            };
          });
      })
    );
  };
}

// https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach#Polyfill
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaNPolyfill
Number.isNaN =
  Number.isNaN ||
  function isNaN(input) {
    return typeof input === 'number' && input !== input;
  };
