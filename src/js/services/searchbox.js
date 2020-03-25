const boxKlass = 'searchbox';
const activeKlass = 'searchbox_active';
const btnKlass = 'searchbox__btn';
const textFieldKlass = 'searchbox__val';

function shift($box) {
  const $btn = $box.find(`.${btnKlass}`);

  $btn.css('transform', `translate(${$box.innerWidth() - $btn.outerWidth()}px, 0)`);
}
function unshift($box) {
  $box.find(`.${btnKlass}`).css('transform', '');
}

function handleShifting($box, $input) {
  if ($input.val()) {
    shift($box.addClass(activeKlass));
  } else if (!$input.data('mousedown') && !$box.hasClass('error')) {
    unshift($box.removeClass(activeKlass));
  }
}

function Searchbox(element, options) {
  this.element = element;
  this.options = options;
}
Searchbox.prototype.init = function init() {
  const $element = $(this.element);

  handleShifting($element, $element.find(`.${textFieldKlass}`));
};
Searchbox.prototype.destroy = function destroy() {};

$(document)
  .on('mouseleave', `.${boxKlass}`, function () {
    const $textField = $(this).find(`.${textFieldKlass}`);

    if (!$textField.is(':focus')) {
      $textField.trigger('blur');
    }
  })
  .on('focus', `.${textFieldKlass}`, function () {
    shift($(this).closest(`.${boxKlass}`));
  })
  .on('blur', `.${textFieldKlass}`, function () {
    const $box = $(this).closest(`.${boxKlass}`);

    handleShifting($box, $(this));
  });

export default {
  create($elements, options) {
    const currentInstances = [];

    $.each($elements, (i, element) => {
      currentInstances.push(new Searchbox(element, options));
    });

    return currentInstances.length === 1 ? currentInstances[0] : currentInstances;
  },
  boxKlass,
};
