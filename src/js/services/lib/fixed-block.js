import 'sticky-kit/dist/sticky-kit';

const commonParentKlass = 'js-fixed-common-parent';

function initFixedBlocks($blocks) {
  $.each($blocks, function () {
    const $block = $(this);

    $block
      .on('sticky_kit:bottom', function () {
        $(this).parent().css('position', 'static');
      })
      .on('sticky_kit:unbottom', function () {
        $(this).parent().css('position', '');
      })
      .stick_in_parent({
        parent: $block.closest(`.${commonParentKlass}`),
        offset_top: parseInt($block.css('marginBottom'), 10),
      });
  });
}

$(document).on('content-update', () => {
  $('body').trigger('sticky_kit:recalc');
});

export default initFixedBlocks;
