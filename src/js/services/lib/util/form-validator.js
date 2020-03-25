import 'jquery-validation';
import { isValidated, validationHook } from './form-validity';

/**
 * Form validation: http://jqueryvalidation.org/documentation/
 */

const validatedFieldKlass = 'validate-field';

$.validator.addMethod('phoneRU', function phoneRU(value) {
  return /^((8|\+7)[- ]?)?(\(?\d{3}\)?[- ]?)?[\d\- ]{7,10}$/.test(value);
});
$.validator.addMethod('regex', function regex(value, element, regexp) {
  const re = new RegExp(regexp);
  return this.optional(element) || re.test(value);
});
/*
 * Translated default messages for the jQuery validation plugin.
 * Locale: RU (Russian; русский язык)
 */
$.extend($.validator.messages, {
  required: 'Заполните поле.',
  remote: 'Пожалуйста, введите правильное значение.',
  email: 'Неверно введён email.',
  url: 'Пожалуйста, введите корректный URL.',
  date: 'Пожалуйста, введите корректную дату.',
  dateISO: 'Пожалуйста, введите корректную дату в формате ISO.',
  number: 'Пожалуйста, введите число.',
  digits: 'Пожалуйста, вводите только цифры.',
  creditcard: 'Пожалуйста, введите правильный номер кредитной карты.',
  equalTo: 'Пожалуйста, введите то же значение.',
  extension: 'Пожалуйста, выберите файл с правильным расширением.',
  maxlength: $.validator.format('Пожалуйста, введите не больше {0} символов.'),
  minlength: $.validator.format('Пожалуйста, введите не меньше {0} символов.'),
  rangelength: $.validator.format('Пожалуйста, введите значение длиной от {0} до {1} символов.'),
  range: $.validator.format('Пожалуйста, введите число от {0} до {1}.'),
  max: $.validator.format('Пожалуйста, введите число, меньшее или равное {0}.'),
  min: $.validator.format('Пожалуйста, введите число, большее или равное {0}.'),
  phoneRU: 'Введите номер телефона.',
  regex: 'Пожалуйста, заполните поле правильно.',
});

function attachValidation(elem, opt) {
  elem
    .on('invalid-form.validate', () => {
      /* on form validate */
    })
    .validate(
      $.extend(
        true,
        {
          highlight(element, errorClass, validClass) {
            let $elemContainer;
            let $validatedField;
            const $elem = $(element);

            if (!$elem.hasClass('noerror')) {
              if (element.type === 'radio' || element.type === 'checkbox') {
                this.findByName(element.name).addClass(errorClass).removeClass(validClass);
              } else {
                $validatedField = $elem.closest(`.${validatedFieldKlass}`);
                $elemContainer = $validatedField.length ? $validatedField : $elem.parent();
                $elemContainer.addClass(errorClass).removeClass(validClass);
              }
            }
          },
          unhighlight(element, errorClass, validClass) {
            let $elemContainer;
            let $validatedField;
            const $elem = $(element);

            if (!$elem.hasClass('noerror')) {
              if (element.type === 'radio' || element.type === 'checkbox') {
                this.findByName(element.name).removeClass(errorClass).addClass(validClass);
              } else {
                $validatedField = $elem.closest(`.${validatedFieldKlass}`);
                $elemContainer = $validatedField.length ? $validatedField : $elem.parent();
                $elemContainer.removeClass(errorClass).addClass(validClass);
              }
            }
          },
          errorPlacement(error, element) {
            const $validatedField = element.closest(`.${validatedFieldKlass}`);

            if (!element.hasClass('noerror')) {
              if ($validatedField.length) {
                $validatedField.append(error);
              } else {
                error.insertAfter(element);
              }
            }
          },
          onkeyup: false,
          onfocusout: elem.hasClass(`${validationHook}_nofocus`)
            ? false
            : function onfocusout(element) {
                const $elem = $(element);

                if (
                  $elem.rules().required &&
                  $elem.val() &&
                  !$elem.hasClass('nofocusout') &&
                  !$elem.hasClass('ignore') /* &&
                  !$elem.data('mousedown') */
                ) {
                  $elem.valid();
                }
              },
          ignore() {
            const $that = $(this);

            return (
              $that.is(':hidden:not(input[type="hidden"])') ||
              ($that.is('input[type="hidden"]') && $that.parent().is(':hidden')) ||
              $that.hasClass('ignore')
            );
          },
          focusInvalid: false,
          focusCleanup: true,
          ignoreTitle: true,
          onclick(element) {
            if ($(element).is('select')) {
              return;
            }
            // click on selects, radiobuttons and checkboxes
            if (element.name in this.submitted) {
              this.element(element);

              // or option elements, check parent select in that case
            } else if (element.parentNode.name in this.submitted) {
              this.element(element.parentNode);
            }
          },
        },
        opt
      )
    );
}

function resetFieldsValidation($fields, validator) {
  // https://stackoverflow.com/a/38340910/718630
  $.each($fields, (i, elem) => {
    if (validator.settings.unhighlight) {
      validator.settings.unhighlight.call(
        validator,
        elem,
        validator.settings.errorClass,
        validator.settings.validClass
      );
    }
    validator.hideThese(validator.errorsFor(elem));
  });
}

/* reset validation on form reset */
$(document)
  .on('reset', 'form', (e) => {
    const $form = $(e.target);
    let validator;

    if (isValidated($form[0])) {
      validator = $form.validate();
      validator.resetForm();

      $form[0]
        .querySelectorAll(`.${validator.settings.errorClass}, .${validator.settings.validClass}`)
        .forEach((el) => {
          el.classList.remove(validator.settings.errorClass, validator.settings.validClass);
        });
    }
  })
  /* reset validation on tab change */
  .on('tabsactivate', (event, ui) => {
    const $outerValidateForm = ui.oldPanel.closest(`.${validationHook}`);
    let outerValidator;

    if ($outerValidateForm.length) {
      outerValidator = $outerValidateForm.validate();
      resetFieldsValidation(
        $(ui.oldPanel.querySelectorAll(`.${outerValidator.settings.errorClass}`)).find(':input'),
        outerValidator
      );
    }
  });

export default {
  init($form, validatorOptions = {}) {
    $form.each((i, el) => {
      const form = $(el);

      attachValidation(form, validatorOptions);
      form.on('input paste', (e) => {
        $(e.target).trigger('focus');
      });
    });
  },
  resetFieldsValidation,
};
