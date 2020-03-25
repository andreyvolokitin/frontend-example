import $ from 'jquery';
import synchronizer from './util/synchronizer';

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'deletable';
const DATA_KEY = `comp.${NAME}`;
const EVENT_NAMESPACE = `.${DATA_KEY}`;
const JQUERY_NO_CONFLICT = $.fn[NAME];

const ClassName = {
  CONTAINER: 'deletable',
  ITEM: 'deletable__item',
  CONTROL: 'deletable__control',
  EMPTY: 'is-empty',
};

const Selector = {
  CONTAINER: `.${ClassName.CONTAINER}`,
  ITEM: `.${ClassName.ITEM}`,
  CONTROL: `.${ClassName.CONTROL}`,
  SYNC: '[data-sync="true"]',
};

const Event = {
  CLICK: `click${EVENT_NAMESPACE}`,
  DELETED: `deleted${EVENT_NAMESPACE}`,
};

/**
 * ------------------------------------------------------------------------
 * "Class" Definition
 * ------------------------------------------------------------------------
 */

function Deletable(element) {
  this.element = element;
}
Deletable.prototype = {
  constructor: Deletable,
  delete(itemElem) {
    // todo: support animated delete

    if (!itemElem.matches(Selector.ITEM)) {
      return false;
    }

    itemElem.parentNode.removeChild(itemElem);
    this.handleEmpty();

    $(this.element).trigger(Event.DELETED, {
      item: itemElem,
    });

    return true;
  },
  deleteSync(itemElem) {
    synchronizer.call(this, 'delete', itemElem);
  },
  handleEmpty() {
    if (this.element.querySelectorAll(Selector.ITEM).length === 0) {
      this.element.classList.add(ClassName.EMPTY);
    }
  },
  destroy() {
    $.removeData(this.element, DATA_KEY);
    this.element = null;
  },
};

Deletable.jQueryInterface = function jQueryInterface(config, ...args) {
  return this.each(function () {
    let data = $(this).data(DATA_KEY);

    if (!data) {
      data = new Deletable(this);
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

$(document).on(Event.CLICK, Selector.CONTROL, (e) => {
  const widget = e.target.closest(Selector.CONTAINER);
  const methodName = `delete${widget.matches(Selector.SYNC) ? 'Sync' : ''}`;

  Deletable.jQueryInterface.call($(widget), methodName, e.target.closest(Selector.ITEM));
});

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.fn[NAME] = Deletable.jQueryInterface;
$.fn[NAME].Constructor = Deletable;
$.fn[NAME].noConflict = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT;
  return Deletable.jQueryInterface;
};

export default Deletable;
