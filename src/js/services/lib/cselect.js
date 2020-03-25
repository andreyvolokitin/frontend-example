import $ from 'jquery';
import '../../../trash/jquery.mobile.custom/jquery.mobile.custom.min';
import '../../../trash/jquery.mobile.custom/jquery.mobile.core.css';
import '../../../trash/jquery.mobile.custom/jquery.mobile.forms.select.css';

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'cselect';
const DATA_KEY = `comp.${NAME}`;
const JQUERY_NO_CONFLICT = $.fn[NAME];

const ClassName = {
  SELECT: 'cselect',
  INLINE: 'cselect_inline',
  FULLWIDTH: 'cselect_full',
  INITIALIZED: 'cselect_inited',
  INITIALIZED_WRAPPER: 'ui-select',
  INITIALIZED_BTN: 'ui-btn',
};

const Selector = {
  SELECT: `.${ClassName.SELECT}`,
  INITIALIZED: `.${ClassName.INITIALIZED}`,
  INITIALIZED_WRAPPER: `.${ClassName.INITIALIZED_WRAPPER}`,
  INITIALIZED_BTN: `.${ClassName.INITIALIZED_BTN}`,
};

/**
 * ------------------------------------------------------------------------
 * "Class" Definition
 * ------------------------------------------------------------------------
 */
// See API documentation for `selectmenu` widget: https://api.jquerymobile.com/selectmenu/
function Cselect(element) {
  this.element = element;

  const $select = $(this.element);
  const isInline = $select.hasClass(ClassName.INLINE);

  $select
    .not(Selector.INITIALIZED)
    .selectmenu({
      inline: isInline,
      disabled: $select.is(':disabled'),
      preventFocusZoom: false,
    })
    .addClass(ClassName.INITIALIZED);

  this.setWidth();
}
Cselect.prototype = {
  constructor: Cselect,
  setWidth() {
    const $select = $(this.element);
    const isInline = $select.hasClass(ClassName.INLINE);
    const isFull = $select.hasClass(ClassName.FULLWIDTH);

    if (!$select.is(':visible') || isInline || isFull) {
      return;
    }

    const $wrapper = $select.closest(Selector.INITIALIZED_WRAPPER);
    const $btn = $wrapper.find(Selector.INITIALIZED_BTN);

    $select.css('width', 'auto');
    const w = $select.width();
    $select.css('width', '');

    $wrapper.width(w + ($btn.outerWidth() - $btn.width()) /* + 10 */);
  },
  destroy() {
    $(this.element).selectmenu('destroy');
    $.removeData(this.element, DATA_KEY);
    this.element = null;
  },
};

Cselect.jQueryInterface = function jQueryInterface(config, ...args) {
  return this.each(function () {
    let data = $(this).data(DATA_KEY);

    if (!data) {
      data = new Cselect(this);
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

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.fn[NAME] = Cselect.jQueryInterface;
$.fn[NAME].Constructor = Cselect;
$.fn[NAME].noConflict = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT;
  return Cselect.jQueryInterface;
};

export default Cselect;
