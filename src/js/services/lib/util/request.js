// 2.9kb alternative: https://github.com/taylorhakes/promise-polyfill
import 'es6-promise/auto';
import 'custom-event-polyfill';
import assign from 'object-assign';
import Spinner, { options as spinnerDefaults } from './spinner';
import { validToSubmit, isValidated, disableValidation, enableValidation } from './form-validity';
import getTimestamp from './get-timestamp';

const targetKlass = 'js-request-target';
const processingKlass = 'is-processing';
const successKlass = 'is-successful';
const failKlass = 'is-failed';
const requestedKlass = 'is-requested';
const disabledKlass = 'disabled';
const spinnerCenteredKlass = 'spinner-centered';

function setDisabled(elem, disabled) {
  elem.classList[disabled ? 'add' : 'remove'](disabledKlass);

  if (elem.tagName.toLowerCase() === 'button') {
    // eslint-disable-next-line no-param-reassign
    elem.disabled = disabled;
  }
}

/**
 * Designate request state with a spinner, class names and events on target element(s)
 * @param fn {Function} - function with request code, can handle request promise (for early handling without `minimalRequestDelay`),
 * should return initial request object.
 * @param opts:
 *  target {HTMLElement} - element associated with request, which will receive class names and events regarding request state
 *  spinTarget {HTMLElement|Boolean} - optional element to append the spinner, will receive class names regarding request state. "False" for no spinner
 *  allowConcurrent {Boolean} - allow concurrent requests while there is already pending request for the same target
 *  allowSubsequent {Boolean} - always allow requests for the same target (as opposed to allowing only one successful request)
 *  spinner {Object} - spinner options (`spin.js`)
 * @returns {Promise} - initial request object
 */
function request(fn, opts) {
  const defaults = {
    target: document.documentElement,
    spinTarget() {
      return this.target.querySelector('button[type="submit"]') || this.target;
    },
    allowConcurrent() {
      return this.target.tagName.toLowerCase() !== 'form';
    },
    allowSubsequent: true,
    spinner: {
      className: 'request-spinner',
      length: 4,
      radius: 3,
    },
  };
  const options = assign({}, defaults, opts);
  const spinnerOptions = assign({}, spinnerDefaults, options.spinner);

  const { target, allowSubsequent } = options;
  const resultRecoverTimeout = 1000;
  const minimalRequestDelay = 300;
  let { spinTarget, allowConcurrent } = options;

  if (typeof spinTarget === 'function') {
    spinTarget = spinTarget.apply(options);
  }

  if (typeof allowConcurrent === 'function') {
    allowConcurrent = allowConcurrent.apply(options);
  }

  function stopSpinner(element) {
    const $elem = $(element);
    const spinner = $elem.data('spinner');

    if (spinner) {
      spinner.stop();
      $elem.data('spinner', false);
    }
  }

  function startSpinner(element) {
    stopSpinner(element);
    const spinner = new Spinner(spinnerOptions).spin(element);
    $(element).data('spinner', spinner);

    return spinner;
  }

  if (
    !validToSubmit(target) ||
    (!allowConcurrent && target.classList.contains(processingKlass)) ||
    (!allowSubsequent && target.classList.contains(requestedKlass))
  ) {
    return false;
  }

  const req = fn();
  let pendingSize = $(target).data('pending') || 0;

  if (!allowConcurrent && isValidated(target)) {
    disableValidation(target);
  }

  if (spinTarget) {
    if (!spinTarget.classList.contains(processingKlass)) {
      if (spinTarget.classList.contains('button')) {
        const innerElems = spinTarget.querySelectorAll('.button__icon, .button__text');
        const space = Math.abs(
          spinTarget.getBoundingClientRect().right -
            (innerElems[1] || innerElems[0]).getBoundingClientRect().right
        );
        const spinnerWidth = (spinnerOptions.radius + spinnerOptions.length) * 2 * 1.5;
        const spacing = 12;

        // console.log(space, spinnerWidth + spacing, space < spinnerWidth + spacing);

        if (space < spinnerWidth + spacing) {
          spinTarget.classList.add(spinnerCenteredKlass);
        }
      }

      spinTarget.classList.add(processingKlass);
      startSpinner(spinTarget);
    }

    if (!allowConcurrent) {
      // allow button events to bubble before disabling
      setTimeout(() => setDisabled(spinTarget, true), 0);
    }
  }

  target.classList.add(processingKlass);

  $(target).data('pending', (pendingSize += 1));

  if (target.dataset.feedbackTid > -1) {
    clearTimeout(target.dataset.feedbackTid);
    target.dataset.feedbackTid = -1;
  }

  function cb(isSuccess, response) {
    if (isSuccess && !allowSubsequent) {
      target.classList.add(requestedKlass);
      target.dispatchEvent(new CustomEvent('content-update', { bubbles: true }));

      if (spinTarget) {
        spinTarget.classList.add(requestedKlass);
      }

      const targetId = getTimestamp();

      if (!('targetId' in target.dataset)) {
        target.dataset.targetId = targetId;
        target.classList.add(targetKlass);

        if (spinTarget) {
          spinTarget.dataset.targetId = targetId;
        }
      } else if (spinTarget && !('targetId' in spinTarget.dataset)) {
        spinTarget.dataset.targetId = target.dataset.targetId;
      }
    }

    if (!allowConcurrent && isValidated(target)) {
      enableValidation(target);
    }

    let pending = $(target).data('pending') || 0;

    if (pending < 2) {
      target.classList.remove(processingKlass);
      target.classList.add(isSuccess ? successKlass : failKlass);

      if (spinTarget) {
        spinTarget.classList.remove(processingKlass);
        spinTarget.classList.add(isSuccess ? successKlass : failKlass);
        stopSpinner(spinTarget);

        if (!allowConcurrent) {
          setDisabled(spinTarget, false);
        }
      }

      target.dataset.feedbackTid = setTimeout(() => {
        target.classList.remove(failKlass);

        if (spinTarget) {
          spinTarget.classList.remove(failKlass, spinnerCenteredKlass);
        }

        if (allowSubsequent) {
          target.classList.remove(successKlass);

          if (spinTarget) {
            spinTarget.classList.remove(successKlass);
          }
        }
      }, resultRecoverTimeout);
    }

    $(target).data('pending', (pending -= 1));
    $(target).trigger(`request-${isSuccess ? 'success' : 'fail'}`, response);
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(() => resolve(), ms));
  }

  return Promise.allSettled([req, delay(minimalRequestDelay)])
    .then((results) => results[0].value || results[0].reason)
    .then(
      (response) => cb(true, response),
      (error) => cb(false, error)
    )
    .then(() => req);
}

function resetRequested(target) {
  const wasRequested = target.classList.contains(requestedKlass);

  if (target.classList.contains(processingKlass)) {
    return;
  }

  document.querySelectorAll(`[data-target-id='${target.dataset.targetId}']`).forEach((elem) => {
    elem.classList.remove(successKlass, requestedKlass);
    // eslint-disable-next-line no-param-reassign
    delete elem.dataset.targetId;

    if (elem !== target) {
      setDisabled(elem, false);
    }
  });

  // eslint-disable-next-line no-param-reassign
  delete target.dataset.feedbackTid;

  if (wasRequested) {
    target.classList.remove(targetKlass);
    target.dispatchEvent(new CustomEvent('content-update', { bubbles: true }));
  }

  if (isValidated(target)) {
    enableValidation(target);
  }
}

$(document).on('hidden.bs.modal', (e) => {
  const requestedTarget = e.target.querySelector(`.${requestedKlass}`);

  if (requestedTarget) {
    resetRequested(requestedTarget);
  }
});

export { request as default, resetRequested, targetKlass };
