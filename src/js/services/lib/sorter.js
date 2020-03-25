import $ from 'jquery';

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'sorter';
const DATA_KEY = `comp.${NAME}`;
const EVENT_NAMESPACE = `.${DATA_KEY}`;
const JQUERY_NO_CONFLICT = $.fn[NAME];

const ClassName = {
  SORTER: 'sorter',
  ACTIVE: 'is-active',
};

const Selector = {
  SORTER: `.${ClassName.SORTER}`,
  ACTIVE: `.${ClassName.ACTIVE}`,
};

const Event = {
  CLICK: `click${EVENT_NAMESPACE}`,
  SORT: `sort${EVENT_NAMESPACE}`,
};

const Orders = ['asc', 'desc'];

/**
 * ------------------------------------------------------------------------
 * "Class" Definition
 * ------------------------------------------------------------------------
 */

function Sorter(element) {
  this.element = element;
  this.defaultState = this.element.dataset.order;
}
Sorter.prototype = {
  constructor: Sorter,
  resetState() {
    this.element.dataset.order = this.defaultState;
  },
  sort(order) {
    document
      .querySelectorAll(`${Selector.SORTER}[data-group="${this.element.dataset.group}"]`)
      .forEach((elem) => {
        const resetForbidden = elem.dataset.reset === 'false';

        if (elem !== this.element) {
          elem.classList.remove(ClassName.ACTIVE);
          if (!resetForbidden) {
            $(elem).sorter('resetState');
          }
        }
      });

    if (Orders.indexOf(order) !== -1) {
      this.element.dataset.order = order;
    } else if (this.element.matches(Selector.ACTIVE)) {
      this.element.dataset.order = Orders[(Orders.indexOf(this.element.dataset.order) + 1) % 2];
    }

    $(this.element).addClass(ClassName.ACTIVE).trigger(Event.SORT);
  },
  destroy() {
    $.removeData(this.element, DATA_KEY);
    this.element = null;
  },
};

Sorter.jQueryInterface = function jQueryInterface(config, ...args) {
  return this.each(function () {
    let data = $(this).data(DATA_KEY);

    if (!data) {
      data = new Sorter(this);
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

$(document).on(Event.CLICK, Selector.SORTER, (e) => {
  Sorter.jQueryInterface.call($(e.target), 'sort');
});

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.fn[NAME] = Sorter.jQueryInterface;
$.fn[NAME].Constructor = Sorter;
$.fn[NAME].noConflict = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT;
  return Sorter.jQueryInterface;
};

export default Sorter;
