const disabledKlass = 'js-service-disabled';

function disableHidden(fields) {
  const $inputsTypeHidden = fields.filter('input[type="hidden"]');
  const $hiddenInputsTypeHidden = $inputsTypeHidden.filter(function () {
    return $(this).parent().is(':hidden');
  });

  fields
    .not($inputsTypeHidden)
    .filter(':hidden')
    .add($hiddenInputsTypeHidden)
    .addClass(disabledKlass)
    .prop('disabled', true);
}
function enableFields(fields) {
  fields.prop('disabled', false).removeClass(disabledKlass);
}

// $(document).on('submit', 'form', function(e) {
//   const $form = $(this);
//   let $fields;
//
//   if (e.originalEvent !== undefined) {
//     $fields = $form.find(
//       'input:not(.is-disabled), select:not(.is-disabled), textarea:not(.is-disabled)'
//     );
//
//     e.preventDefault();
//     disableHidden($fields);
//     $form.submit();
//     enableFields($fields);
//   }
// });

export { disableHidden, enableFields };
