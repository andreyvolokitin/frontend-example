function resetFormElements($form) {
  const $selects2 = $form.find('select.select2');
  const $fileInputs = $form.find('input.finput');

  setTimeout(() => {
    if ($selects2.length) {
      $selects2.trigger('change.select2');
    }

    $fileInputs.trigger('change');
  }, 0);
}

export default resetFormElements;
