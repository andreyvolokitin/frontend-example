/**
 * Refresh common project-specific widgets on different occasions.
 */
$(document).on('tabsactivate tabscreate', (event, ui) => {
  const $panel = ui.newPanel || ui.panel;
  const $fotorama = $panel.find('.fotorama');
  const $slick = $panel.find('.slick-initialized');
  const $scrollable = $panel.find('.scroll');

  $.each($scrollable, (i, el) => {
    const baronData = $(el).data('baron');

    if (baronData) {
      Object.keys(baronData).forEach((baronInstance) => baronData[baronInstance].update());
    }
  });

  if ($fotorama.length) {
    $.each($fotorama, (i, el) => $(el).data('fotorama').resize());
  }

  if ($slick.length) {
    $.each($slick, (i, el) => {
      $(el).slick('setPosition');
      $(el).slick('checkResponsive');
    });
  }

  // trigger project-wide "refresh" event
  $panel.trigger('content-update');
});
$(document).on('tabsload', (event, ui) => {
  // trigger project-wide "refresh" event
  ui.panel.trigger('content-update');
});
