import $ from 'jquery';

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'numeric';
const DATA_KEY = `comp.${NAME}`;
const EVENT_NAMESPACE = `.${DATA_KEY}`;
const JQUERY_NO_CONFLICT = $.fn[NAME];

const ClassName = {
  NUMERIC: 'numeric',
};

const Selector = {
  NUMERIC: `.${ClassName.NUMERIC}`,
  FLOAT: '[data-float]',
};

const Event = {
  INPUT_PASTE_CHANGE: `input${EVENT_NAMESPACE} paste${EVENT_NAMESPACE} change${EVENT_NAMESPACE}`,
  NAN_ENTERED: 'nan-entered',
  NUM_ENTERED: 'num-entered',
  EMPTY_ENTERED: 'empty-entered',
  VALUE_CHANGED: 'value-changed',
};

/**
 * Parse a string containing numeric value (float supported), allow commas and spaces,
 * don't allow other non-numeric characters, treat empty string as NaN.
 * @param {String} val - value to parse
 * @returns {Number|String} - parsed number or empty string
 */
function parseNumeric(val) {
  if (!val.length) {
    return val;
  }

  return Number($.trim(val.replace(/,/gm, '.').replace(/\s+/g, '')));
}

/**
 * Validate entered numeric input value.
 * Notify of the type of value entered (numeric, NaN or empty), and if the value was changed.
 * Reset value if less/greater than limit, or non-allowed float.
 * @param {Object|Boolean} e - event for the input value change, or `false`
 * @param {jQuery} $input - input element
 * @param {Boolean} allowFloat - is float input value allowed?
 */
function validateNumericInput(e, $input, allowFloat) {
  const val = $input.val();
  const isEmpty = !val.length;
  const parsedFloatVal = parseNumeric(val);
  const isNaN = Number.isNaN(parsedFloatVal);
  const isFloat = !isNaN && !isEmpty ? parsedFloatVal % 1 !== 0 : false;
  const parsedVal = allowFloat || isEmpty ? parsedFloatVal : Math.round(parsedFloatVal);
  const minVal = Number($input.data('min')) || 0;
  const maxVal = Number($input.data('max')) || Number.POSITIVE_INFINITY;
  const isLtMin = parsedVal < minVal;
  const isGtMax = parsedVal > maxVal;
  let currentVal = parsedVal;
  const prevVal = $input.data('prev-val') || $input[0].defaultValue;

  if (isNaN) {
    $input.trigger(Event.NAN_ENTERED);
  } else if (!isEmpty) {
    if (e.type === 'change') {
      if (isLtMin) {
        currentVal = minVal;
        $input.val(currentVal);
      } else if (isGtMax) {
        currentVal = maxVal;
        $input.val(currentVal);
      } else if (!allowFloat && isFloat) {
        $input.val(currentVal);
      }
    }

    $input.trigger(Event.NUM_ENTERED);
  } else if (e.type === 'change' && $input.data('min')) {
    $input.val(minVal);
    $input.trigger(Event.NUM_ENTERED);
  } else {
    $input.trigger(Event.EMPTY_ENTERED);
  }

  $input.data('prev-val', currentVal);

  if (prevVal !== currentVal) {
    $input.trigger(Event.VALUE_CHANGED);
  }
}

/**
 * ------------------------------------------------------------------------
 * "Class" Definition
 * ------------------------------------------------------------------------
 */

function Numeric(element) {
  this.element = element;

  if (this.element.value) {
    this.validate(false);
  }
}
Numeric.prototype = {
  constructor: Numeric,
  validate(e) {
    const $elem = $(this.element);

    validateNumericInput(e, $elem, $elem.is(Selector.FLOAT));
  },
  destroy() {
    $.removeData(this.element, DATA_KEY);
    this.element = null;
  },
};

Numeric.jQueryInterface = function jQueryInterface(config, ...args) {
  return this.each(function () {
    let data = $(this).data(DATA_KEY);

    if (!data) {
      data = new Numeric(this);
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

$(document).on(Event.INPUT_PASTE_CHANGE, Selector.NUMERIC, function (e) {
  Numeric.jQueryInterface.call($(this), 'validate', e);
});

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.fn[NAME] = Numeric.jQueryInterface;
$.fn[NAME].Constructor = Numeric;
$.fn[NAME].noConflict = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT;
  return Numeric.jQueryInterface;
};

export default Numeric;
