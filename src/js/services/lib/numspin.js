import $ from 'jquery';

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'numspin';
const DATA_KEY = `comp.${NAME}`;
const EVENT_NAMESPACE = `.${DATA_KEY}`;
const JQUERY_NO_CONFLICT = $.fn[NAME];

const ClassName = {
  NUMSPIN: 'numspin',
  NUMSPIN_CONTROL: 'numspin__control',
  NUMSPIN_DECREMENT: 'numspin__control_dec',
  NUMSPIN_INCREMENT: 'numspin__control_inc',
  NUMSPIN_INPUT: 'numspin__input',
};

const Selector = {
  NUMSPIN: `.${ClassName.NUMSPIN}`,
  NUMSPIN_CONTROL: `.${ClassName.NUMSPIN_CONTROL}`,
  NUMSPIN_DECREMENT: `.${ClassName.NUMSPIN_DECREMENT}`,
  NUMSPIN_INCREMENT: `.${ClassName.NUMSPIN_INCREMENT}`,
  NUMSPIN_INPUT: `.${ClassName.NUMSPIN_INPUT}`,
};

const Event = {
  CLICK: `click${EVENT_NAMESPACE}`,
};

/**
 * ------------------------------------------------------------------------
 * "Class" Definition
 * ------------------------------------------------------------------------
 */

function Numspin(element) {
  this.element = element;
  this.input = element.querySelector(Selector.NUMSPIN_INPUT);
  this.minimum = parseInt(this.input.dataset.min, 10) || 0;
}
Numspin.prototype = {
  constructor: Numspin,
  getValue() {
    let val;
    let wasNaN = false;

    val = parseInt(this.input.value.replace(/,/gm, '.').replace(/\s+/g, ''), 10);
    if (Number.isNaN(val)) {
      wasNaN = true;
      val = this.minimum;
    }

    return { val, wasNaN };
  },
  increment() {
    const { val } = this.getValue();

    $(this.input)
      .data('prev-val', val + 1)
      .val(val + 1)
      .trigger('change');
  },
  decrement() {
    const { val, wasNaN } = this.getValue();

    if (val > this.minimum) {
      $(this.input)
        .data('prev-val', val - 1)
        .val(val - 1)
        .trigger('change');
    } else if (wasNaN) {
      $(this.input).data('prev-val', this.minimum).val(this.minimum).trigger('change');
    }
  },
  destroy() {
    $.removeData(this.element, DATA_KEY);
    this.element = null;
  },
};

Numspin.jQueryInterface = function jQueryInterface(config, ...args) {
  return this.each(function () {
    let data = $(this).data(DATA_KEY);

    if (!data) {
      data = new Numspin(this);
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

$(document).on(Event.CLICK, Selector.NUMSPIN_CONTROL, (e) => {
  const wrap = e.target.closest(Selector.NUMSPIN);

  if (e.target.matches(Selector.NUMSPIN_DECREMENT)) {
    Numspin.jQueryInterface.call($(wrap), 'decrement');
  }
  if (e.target.matches(Selector.NUMSPIN_INCREMENT)) {
    Numspin.jQueryInterface.call($(wrap), 'increment');
  }
});

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.fn[NAME] = Numspin.jQueryInterface;
$.fn[NAME].Constructor = Numspin;
$.fn[NAME].noConflict = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT;
  return Numspin.jQueryInterface;
};

export default Numspin;
