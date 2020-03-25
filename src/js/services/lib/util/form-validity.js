const validationHook = 'js-validate-form';
const validationDisabledKlass = `${validationHook}_disabled`;

function isValidated(form) {
  return form.tagName.toLowerCase() === 'form' && form.classList.contains(validationHook);
}

function isValid(form) {
  return $(form).valid();
}

function validToSubmit(form) {
  return !isValidated(form) || isValid(form);
}

function enableValidation(form) {
  if (isValidated(form) && form.classList.contains(validationDisabledKlass)) {
    $(form).validate().settings.ignore = $(form).data('validate-ignore');
    form.classList.remove(validationDisabledKlass);
  }
}

function disableValidation(form) {
  if (isValidated(form) && !form.classList.contains(validationDisabledKlass)) {
    $(form).data('validate-ignore', $(form).validate().settings.ignore);
    $(form).validate().settings.ignore = '*';
    form.classList.add(validationDisabledKlass);
  }
}

export { isValidated, isValid, validToSubmit, validationHook, enableValidation, disableValidation };
