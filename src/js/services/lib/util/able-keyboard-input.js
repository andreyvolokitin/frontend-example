import 'jquery-ui/ui/focusable';
import 'jquery-ui/ui/tabbable';

function disableInputWithin($container, isFullKeyboard) {
  if (isFullKeyboard) {
    $(document).on('keydown.disable', () => false);
    return;
  }

  const $focusable = $container.find(':focusable');
  const $tabbable = $focusable.filter(':tabbable');

  $.each($tabbable, function () {
    const $elem = $(this);

    $elem.data('old-tabindex', $elem.attr('tabindex'));
  });

  $tabbable.attr({
    'data-tabbable': true,
    tabindex: '-1',
  });

  $focusable.on('keydown.disable', () => false);
}
function enableInputWithin($container, isFullpage) {
  if (isFullpage) {
    $(document).off('keydown.disable');
    return;
  }

  const $focusable = $container.find(':focusable');
  const $tabbable = $container.find('[data-tabbable]');

  $.each($tabbable, function () {
    const $elem = $(this);
    const tabindex = $elem.data('old-tabindex');

    if (tabindex) {
      $elem.attr('tabindex', tabindex);
    }
  });

  $focusable.off('keydown.disable');
}

export { disableInputWithin, enableInputWithin };
