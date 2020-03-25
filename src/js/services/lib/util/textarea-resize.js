import { debounce } from 'throttle-debounce';

$(document).on(
  'mouseup',
  debounce(150, function () {
    const $area = $('textarea:visible').filter(
      (i, elem) => $(elem).outerHeight() !== $(elem).data('y')
    );

    if ($area.length) {
      $.each($area, (i, elem) => {
        $(elem).trigger('content-update').data('y', $(elem).outerHeight());
      });
    }
  })
);
