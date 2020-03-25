import $ from 'jquery';

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'ajaxForm';
const DATA_KEY = `comp.${NAME}`;
const EVENT_NAMESPACE = `.${DATA_KEY}`;
const JQUERY_NO_CONFLICT = $.fn[NAME];

const ClassName = {
  FORM: 'ajax-form',
  SENT: 'is-sent',
};

const Selector = {
  FORM: `.${ClassName.FORM}`,
};

const Event = {
  SUBMIT: `submit${EVENT_NAMESPACE}`,
  SUCCESS: `request-success${EVENT_NAMESPACE}`,
  MODAL_HIDDEN: `hidden.bs.modal${EVENT_NAMESPACE}`,
};

/**
 * ------------------------------------------------------------------------
 * "Class" Definition
 * ------------------------------------------------------------------------
 */

function AjaxForm(element) {
  this.element = element;
}
AjaxForm.prototype = {
  constructor: AjaxForm,
  reset() {
    $(this.element).removeClass(ClassName.SENT).trigger('content-update');
  },
  markAsSent() {
    $(this.element).addClass(ClassName.SENT).trigger('content-update');
  },
  destroy() {
    $.removeData(this.element, DATA_KEY);
    this.element = null;
  },
};

AjaxForm.jQueryInterface = function jQueryInterface(config, ...args) {
  return this.each(function () {
    let data = $(this).data(DATA_KEY);

    if (!data) {
      data = new AjaxForm(this);
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
  .on(Event.SUBMIT, Selector.FORM, (event) => {
    event.preventDefault();
  })
  .on(Event.SUCCESS, Selector.FORM, (e) => {
    AjaxForm.jQueryInterface.call($(e.target), 'markAsSent');
  })
  .on(Event.MODAL_HIDDEN, (e) => {
    const $form = $(Selector.FORM);
    if (e.target.contains($form[0])) {
      AjaxForm.jQueryInterface.call($form, 'reset');
    }
  });
/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.fn[NAME] = AjaxForm.jQueryInterface;
$.fn[NAME].Constructor = AjaxForm;
$.fn[NAME].noConflict = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT;
  return AjaxForm.jQueryInterface;
};

export default AjaxForm;
