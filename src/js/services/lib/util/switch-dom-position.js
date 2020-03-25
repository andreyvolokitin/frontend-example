function moveBlock($block, $blockHolder) {
  let $blockPlaceholder = $block.data('placeholder');

  if ($block.length && $blockHolder.length) {
    if (!$blockPlaceholder) {
      $blockPlaceholder = $('<div class="adapt-placeholder" />');
      $blockPlaceholder.insertBefore($block).data('block', $block);
      $block.data('placeholder', $blockPlaceholder);
    }
    $block.appendTo($blockHolder);
  }
}
function revertBlock($block) {
  const $blockPlaceholder = $block.data('placeholder');

  if ($block.length && $blockPlaceholder) {
    $block.appendTo($blockPlaceholder);
  }
}

export { moveBlock, revertBlock };
