import $ from 'jquery';

/**
 * Use `data-autowidth="true"` in HTML to designate `autowidth` option.
 * Use `data-autowidth="skip"` in HTML to designate `autowidth` option with "skip" behavior
 * (initially handle width manually instead of doing it automatically).
 */

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'select';
const DATA_KEY = `comp.${NAME}`;
const EVENT_NAMESPACE = `.${DATA_KEY}`;
const JQUERY_NO_CONFLICT = $.fn[NAME];

const ClassName = {
  WRAPPER: 'select',
  GHOST: 'select_ghost',
  SELECT: 'select__select',
  LABEL: 'is-label',
  LABELED: 'select_labeled',
};

const Selector = {
  WRAPPER: `.${ClassName.WRAPPER}`,
  GHOST: `.${ClassName.GHOST}`,
  SELECT: `.${ClassName.SELECT}`,
  FORM: 'form',
  AUTOWIDTH: `.${ClassName.WRAPPER}[data-autowidth]`,
  HAS_LABEL: `.${ClassName.WRAPPER}[data-label]`,
};

const Event = {
  CHANGE: `change${EVENT_NAMESPACE}`,
  RESET: `reset${EVENT_NAMESPACE}`,
};

let fontSize;

/**
 * ------------------------------------------------------------------------
 * "Class" Definition
 * ------------------------------------------------------------------------
 */

function Select(element) {
  this.element = element;
  this.select = element.querySelector(Selector.SELECT);
  this.autowidth = this.element.dataset.autowidth;
  this.defaultSelectedIndex = this.select.selectedIndex;

  let ghost = document.body.querySelector(Selector.GHOST);

  if (typeof this.autowidth !== 'undefined') {
    if (!ghost) {
      ghost = document.createElement('div');
      ghost.innerHTML = `
      <div class="${ClassName.GHOST} ${ClassName.WRAPPER}">
        <select tabindex="-1" class="${ClassName.SELECT}">
          <option>Ghost</option>
        </select>
      </div>`;
      document.body.appendChild(ghost);
    }
  }

  this.handleLabel();

  if (this.autowidth !== 'skip') {
    this.handleWidth();
  }
}
Select.prototype = {
  constructor: Select,
  handleLabel() {
    if (this.select.options[this.select.selectedIndex].classList.contains(ClassName.LABEL)) {
      this.element.classList.add(ClassName.LABELED);
      this.element.setAttribute(
        'data-label',
        this.select.options[this.select.selectedIndex].innerHTML
      );
    } else {
      this.element.classList.remove(ClassName.LABELED);
    }
  },
  handleWidth() {
    if (typeof this.autowidth !== 'undefined') {
      const ghost = document.body.querySelector(Selector.GHOST);
      let ghostSelect;
      let rect;

      if (ghost) {
        ghostSelect = ghost.querySelector(Selector.SELECT);
        ghostSelect.options[0].innerHTML = this.select.options[this.select.selectedIndex].innerHTML;
        ghost.className = `${this.element.className} ${ClassName.GHOST}`;
        rect = ghostSelect.getBoundingClientRect();

        if (typeof fontSize === 'undefined') {
          fontSize = $(ghostSelect).css('fontSize');
        }

        $(this.select).css('width', `${rect.width / fontSize.split('px')[0]}em`);
      }
    }
  },
  reset() {
    this.select.selectedIndex = this.defaultSelectedIndex;
    this.handleLabel();
    this.handleWidth();
  },
  destroy() {
    $.removeData(this.element, DATA_KEY);
    this.element = null;
  },
};

Select.jQueryInterface = function jQueryInterface(config, ...args) {
  return this.each(function () {
    let data = $(this).data(DATA_KEY);

    if (!data) {
      data = new Select(this, typeof config === 'boolean' ? config : undefined);
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
  .on(Event.CHANGE, Selector.SELECT, (e) => {
    Select.jQueryInterface.call($(e.target.parentNode), 'handleLabel');
    Select.jQueryInterface.call($(e.target.parentNode), 'handleWidth');
  })
  .on(Event.RESET, Selector.FORM, (e) => {
    const changedAutowidthSelects = [];

    e.target.querySelectorAll(`${Selector.AUTOWIDTH} ${Selector.SELECT}`).forEach((elem) => {
      if ($(elem.parentNode).data(DATA_KEY).defaultSelectedIndex !== elem.selectedIndex) {
        changedAutowidthSelects.push(elem);
      }
    });
    setTimeout(() => {
      Select.jQueryInterface.call(
        $(e.target.querySelectorAll(`${Selector.HAS_LABEL}:not(.${ClassName.LABELED})`)),
        'handleLabel'
      );

      changedAutowidthSelects.forEach((element) =>
        Select.jQueryInterface.call($(element.parentNode), 'handleWidth')
      );
    }, 0);
  });

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.fn[NAME] = Select.jQueryInterface;
$.fn[NAME].Constructor = Select;
$.fn[NAME].noConflict = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT;
  return Select.jQueryInterface;
};

export default Select;
