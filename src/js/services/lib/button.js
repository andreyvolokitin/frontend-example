import $ from 'jquery';
import isInt from './util/isInt';
import synchronizer from './util/synchronizer';

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'button';
const DATA_KEY = `comp.${NAME}`;
const EVENT_NAMESPACE = `.${DATA_KEY}`;
const JQUERY_NO_CONFLICT = $.fn[NAME];

const ClassName = {
  BUTTON: 'button',
  BTN: 'btn',
  TOGGLABLE: 'button_toggle',
  TOGGLED: 'button_toggled',
  SWAPPABLE: 'button_swap',
  SWAPPED: 'button_swapped',
  FEEDBACK: 'button_feedback',
  DISABLED: 'disabled',
  ACTIVE: 'active',
};

const Selector = {
  BUTTON: `.${ClassName.BUTTON}`,
  BTN: `.${ClassName.BTN}`,
  TOGGLABLE: `.${ClassName.TOGGLABLE}`,
  SWAPPABLE: `.${ClassName.SWAPPABLE}`,
  FEEDBACK: `.${ClassName.FEEDBACK}`,
  FOCUSED: `.${ClassName.BUTTON}:focus, .${ClassName.BTN}:focus`,
  SYNC: '[data-sync="true"]',
};

const Event = {
  CLICK: `click${EVENT_NAMESPACE}`,
  MOUSEUP: `mouseup${EVENT_NAMESPACE}`,
  MOUSEDOWN_UP: `mousedown${EVENT_NAMESPACE} mouseup${EVENT_NAMESPACE}`,
  MOUSELEAVE: `mouseleave${EVENT_NAMESPACE}`,
  TOGGLED: `toggled${EVENT_NAMESPACE}`,
  SWAPPED: `swapped${EVENT_NAMESPACE}`,
};

/**
 * ------------------------------------------------------------------------
 * "Class" Definition
 * ------------------------------------------------------------------------
 */

function Button(element) {
  this.element = element;
  this.prevented = false;
  this.feedbackTimeoutId = -1;
}
Button.prototype = {
  constructor: Button,
  preventStateChange() {
    this.prevented = true;
  },
  allowStateChange() {
    this.prevented = false;
  },
  isPrevented() {
    return this.prevented;
  },
  toggle(isToggled) {
    const $button = $(this.element);
    let toggledTitle;
    let title;
    let wasToggled;
    let actuallyToggled;

    if (
      ($button.hasClass(ClassName.TOGGLABLE) || $button.hasClass(ClassName.FEEDBACK)) &&
      !this.isDisabled() &&
      !this.isPrevented()
    ) {
      wasToggled = $button.hasClass(ClassName.TOGGLED);

      if (wasToggled === isToggled) {
        return false;
      }

      toggledTitle = $button.attr('data-title-toggled');
      title = $button.attr('title');

      if (toggledTitle) {
        $button.attr({
          title: toggledTitle,
          'data-title-toggled': title,
        });
      }

      actuallyToggled =
        typeof isToggled === 'boolean'
          ? isToggled
          : !this.element.classList.contains(ClassName.TOGGLED);

      this.element.setAttribute('aria-pressed', actuallyToggled);
      $button.toggleClass(ClassName.TOGGLED, actuallyToggled).trigger(Event.TOGGLED, {
        isToggled: actuallyToggled,
      });

      return true;
    }

    if (this.isPrevented()) {
      this.allowStateChange();
    }

    return false;
  },
  toggleDisabled(isDisabled) {
    this.element.setAttribute(
      'disabled',
      typeof isDisabled === 'boolean'
        ? isDisabled
        : !this.element.classList.contains(ClassName.DISABLED)
    );
    $(this.element).toggleClass(ClassName.DISABLED, isDisabled);
  },
  swap() {
    if (!this.isPrevented()) {
      $(this.element).addClass(ClassName.SWAPPED).trigger(Event.SWAPPED);
    } else {
      this.allowStateChange();
    }
  },
  feedBack(timeout) {
    const feedbackTimeout = isInt(timeout)
      ? timeout
      : parseInt($(this.element).attr('data-feedback-timeout'), 10) || 3000;

    this.toggle(true);
    clearTimeout(this.feedbackTimeoutId);
    this.feedbackTimeoutId = setTimeout(() => {
      this.toggle(false);
    }, feedbackTimeout);
  },
  toggleSync() {
    synchronizer.call(this, 'toggle');
  },
  swapSync() {
    synchronizer.call(this, 'swap');
  },
  feedBackSync() {
    clearTimeout(this.feedbackTimeoutId);
    synchronizer.call(this, 'feedBack');
  },
  isToggled() {
    return (
      $(this.element).hasClass(ClassName.TOGGLABLE) && $(this.element).hasClass(ClassName.TOGGLED)
    );
  },
  isDisabled() {
    return (
      this.element.getAttribute('disabled') === 'true' ||
      this.element.classList.contains('disabled')
    );
  },
  destroy() {
    $.removeData(this.element, DATA_KEY);
    this.element = null;
  },
};

Button.jQueryInterface = function jQueryInterface(config, ...args) {
  return this.each(function () {
    let data = $(this).data(DATA_KEY);

    if (!data) {
      data = new Button(this);
      $(this).data(DATA_KEY, data);
    }

    if (typeof config === 'string' && typeof data[config] === 'function') {
      data[config](...args);
    }
  });
};
/**
 * ------------------------------------------------------------------------
 * Event binding
 * ------------------------------------------------------------------------
 */

$(document)
  .on(
    Event.CLICK,
    `${Selector.TOGGLABLE}, ${Selector.SWAPPABLE}, ${Selector.FEEDBACK}`,
    (event) => {
      let $button = $(event.target);
      let methodName;

      if (!$button.hasClass(ClassName.BUTTON) && !$button.hasClass(ClassName.BTN)) {
        $button = $button.closest(`${Selector.BUTTON}, ${Selector.BTN}`);
      }

      const isSync = $button.is(Selector.SYNC);

      if ($button.is(Selector.TOGGLABLE)) {
        methodName = `toggle${isSync ? 'Sync' : ''}`;
      }
      if ($button.is(Selector.SWAPPABLE)) {
        methodName = `swap${isSync ? 'Sync' : ''}`;
      }
      if ($button.is(Selector.FEEDBACK)) {
        methodName = `feedBack${isSync ? 'Sync' : ''}`;
      }

      Button.jQueryInterface.call($button, methodName);
    }
  )
  .on(Event.MOUSEUP, `${Selector.BUTTON}, ${Selector.BTN}`, () => {
    $(Selector.FOCUSED).blur();
  })
  .on(Event.MOUSEDOWN_UP, `${Selector.BUTTON}, ${Selector.BTN}`, function (e) {
    $(this).toggleClass(ClassName.ACTIVE, e.type === 'mousedown');
  })
  .on(Event.MOUSELEAVE, `${Selector.BUTTON}, ${Selector.BTN}`, function () {
    $(this).removeClass(ClassName.ACTIVE);
  });

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.fn[NAME] = Button.jQueryInterface;
$.fn[NAME].Constructor = Button;
$.fn[NAME].noConflict = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT;
  return Button.jQueryInterface;
};

export default Button;
