import $ from 'jquery';

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'input';
const DATA_KEY = `comp.${NAME}`;
const EVENT_NAMESPACE = `.${DATA_KEY}`;
const JQUERY_NO_CONFLICT = $.fn[NAME];

const ClassName = {
  INPUT: 'input',
  INPUT_HINTED: 'input_hinted',
  INPUT_FOCUSED: 'input_focused',
  HINT: 'hint',
  HINT_CUSTOM_TRIGGER: 'hint_custom-trigger',
  HINT_BUBBLE: 'hint_bubble',
  HIDDEN: 'is-hidden',
  VISIBLE: 'is-visible',
};

const Selector = {
  INPUT: `.${ClassName.INPUT}`,
  INPUT_HINTED: `.${ClassName.INPUT_HINTED}`,
  INPUT_FOCUSED: `.${ClassName.INPUT_FOCUSED}`,
  HINT: `.${ClassName.HINT}`,
  HINT_CUSTOM_TRIGGER: `.${ClassName.HINT_CUSTOM_TRIGGER}`,
  HINT_BUBBLE: `.${ClassName.HINT_BUBBLE}`,
  TEXT_FIELD: 'input, textarea',
  INPUT_TEXT_FIELD: `.${ClassName.INPUT} input, .${ClassName.INPUT} textarea`,
  INPUT_HINTED_TEXT_FIELD: `.${ClassName.INPUT_HINTED} input, .${ClassName.INPUT_HINTED} textarea`,
  INPUT_HINTED_NUMERIC: `.${ClassName.INPUT_HINTED} .numeric`,
};

const Event = {
  FOCUS: `focus${EVENT_NAMESPACE}`,
  BLUR: `blur${EVENT_NAMESPACE}`,
  CHANGE_MOUSEOVER: `change${EVENT_NAMESPACE} mouseover${EVENT_NAMESPACE}`,
  NAN_ENTERED: 'nan-entered',
  NUM_ENTERED: 'num-entered',
  EMPTY_ENTERED: 'empty-entered',
};

/**
 * ------------------------------------------------------------------------
 * "Class" Definition
 * ------------------------------------------------------------------------
 */

function Input(element) {
  this.element = element;
  this.field = this.element.querySelector(Selector.TEXT_FIELD);
  this.msgs = {
    hint: this.element.querySelectorAll(
      `${Selector.HINT}:not(${Selector.HINT_BUBBLE}):not(${Selector.HINT_CUSTOM_TRIGGER})`
    ),
    bubble: this.element.querySelectorAll(
      `${Selector.HINT_BUBBLE}:not(${Selector.HINT_CUSTOM_TRIGGER})`
    ),
    custom: this.element.querySelectorAll(Selector.HINT_CUSTOM_TRIGGER),
  };

  if (this.field.value) {
    this.hideMsg('hint');
  }
}
Input.prototype = {
  constructor: Input,
  showMsg(type) {
    if (this.element.matches(Selector.INPUT_HINTED)) {
      $(this.msgs[type]).removeClass(ClassName.HIDDEN).addClass(ClassName.VISIBLE);
    }
  },
  hideMsg(type) {
    if (this.element.matches(Selector.INPUT_HINTED)) {
      $(this.msgs[type]).removeClass(ClassName.VISIBLE).addClass(ClassName.HIDDEN);
    }
  },
  destroy() {
    $.removeData(this.element, DATA_KEY);
    this.element = null;
  },
};

Input.jQueryInterface = function jQueryInterface(config, ...args) {
  return this.each(function () {
    let data = $(this).data(DATA_KEY);

    if (!data) {
      data = new Input(this);
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
  .on(Event.FOCUS, Selector.INPUT_TEXT_FIELD, function () {
    const $that = $(this);
    const $wrap = $that.closest(Selector.INPUT);

    $wrap.addClass(ClassName.INPUT_FOCUSED);
    Input.jQueryInterface.call($wrap, 'hideMsg', 'hint');
    Input.jQueryInterface.call($wrap, 'showMsg', 'bubble');
  })
  .on(Event.BLUR, Selector.INPUT_TEXT_FIELD, function () {
    const $that = $(this);
    const $wrap = $that.closest(Selector.INPUT);

    $wrap.removeClass(ClassName.INPUT_FOCUSED);

    if (!this.value) {
      Input.jQueryInterface.call($wrap, 'showMsg', 'hint');
    }

    Input.jQueryInterface.call($wrap, 'hideMsg', 'bubble');
  })
  .on(Event.CHANGE_MOUSEOVER, Selector.INPUT_HINTED_TEXT_FIELD, function () {
    const $that = $(this);
    const $wrap = $that.closest(ClassName.INPUT_HINTED);

    if (this.value) {
      Input.jQueryInterface.call($wrap, 'hideMsg', 'hint');
    }
  })
  .on(
    `${Event.NAN_ENTERED} ${Event.NUM_ENTERED} ${Event.EMPTY_ENTERED}`,
    Selector.INPUT_HINTED_NUMERIC,
    function (e) {
      const $that = $(this);
      const $wrap = $that.closest(Selector.INPUT);

      if (e.type === Event.NAN_ENTERED) {
        Input.jQueryInterface.call($wrap, 'showMsg', 'custom');
      }
      if (e.type === Event.NUM_ENTERED || e.type === Event.EMPTY_ENTERED) {
        Input.jQueryInterface.call($wrap, 'hideMsg', 'custom');
      }
    }
  );

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.fn[NAME] = Input.jQueryInterface;
$.fn[NAME].Constructor = Input;
$.fn[NAME].noConflict = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT;
  return Input.jQueryInterface;
};

export default Input;
