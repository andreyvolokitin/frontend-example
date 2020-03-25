import $ from 'jquery';

/* eslint-disable no-underscore-dangle */

/**
 * Custom request events dispatched by `request` helper. todo: consider using request object and promises instead
 * @type {{REQUEST_FAIL: string, REQUEST_SUCCESS: string}}
 */
const Event = {
  REQUEST_SUCCESS: 'request-success',
  REQUEST_FAIL: 'request-fail',
};

/**
 * Calls method with arguments on the bound object synchronously after request success
 * @param method - method to invoke
 * @param args - optional arguments to the `method`
 */
function synchronizer(method, ...args) {
  if (this._synchronizing) {
    return;
  }

  this._synchronizing = true;
  $(this.element)
    .one(Event.REQUEST_SUCCESS, () => {
      this._synchronizing = false;
      this[method](...args);
      $(this.element).off(Event.REQUEST_FAIL);
    })
    .one(Event.REQUEST_FAIL, () => {
      this._synchronizing = false;
      $(this.element).off(Event.REQUEST_SUCCESS);
    });
}

export default synchronizer;
