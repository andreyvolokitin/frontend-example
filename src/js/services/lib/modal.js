import { throttle } from 'throttle-debounce';
import 'bootstrap/js/dist/modal';
import 'jquery-ui/ui/tabbable';
import browser from './util/browser';
import { getIOSWindowHeight, getHeightOfIOSToolbars } from './util/ios-utils';

const $win = $(window);
const $doc = $(document);
const $body = $('body');
const defaultIOSToolbarsHeight = getHeightOfIOSToolbars();
const dialogShowStartKlass = 'dialog-show-start';
const dialogShowEndKlass = 'dialog-show-end';
const dialogHideStartKlass = 'dialog-hide-start';
const dialogHideEndKlass = 'dialog-hide-end';
const backdropShowStartKlass = 'backdrop-show-start';
const backdropShowEndKlass = 'backdrop-show-end';
const backdropHideStartKlass = 'backdrop-hide-start';
// const modalOpenKlass = 'modal-open';
const overflowXKlass = 'modal-overflow-x';
const overflowYKlass = 'modal-overflow-y';
const fullscreenKlass = 'modal-fullscreen';
const fullscreenModalKlass = 'modal_fullscreen';
const tempVisKlass = 'modal_visible-offscreen';
const noTransitionKlass = 'notrs';
const autocloseKlass = 'modal_autoclose';
const autocloseDelay = 4000;
const $onpageDialog = $('.modal-dialog');
const $onpageModal = $('.modal.fade');
const dialogTransitionDuration = Modernizr.csstransitions
  ? parseFloat(
      $onpageDialog.length && $onpageDialog.eq(0).css('transition-duration').split('s')[0]
    ) * 1000
  : 0;
const backdropTransitionDuration = Modernizr.csstransitions
  ? parseFloat($onpageModal.length && $onpageModal.eq(0).css('transition-duration').split('s')[0]) *
    1000
  : 0;

let onShowTID;
let autocloseTID;

function watchTab(e, modal) {
  const $tabbable = $(':tabbable:first, :tabbable:last', modal);
  let $tabbableSet;
  let isSingle = false;

  if ($tabbable.length === 1) {
    $tabbableSet = $().add(modal).add($tabbable);
    isSingle = true;
  } else {
    $tabbableSet = $tabbable;
  }

  // if it's the first or last tabbable element, refocus
  if (
    (!e.shiftKey && e.target === $tabbableSet[$tabbableSet.length - 1]) ||
    (e.shiftKey && e.target === $tabbableSet[0]) ||
    (isSingle && e.shiftKey && e.target === $tabbableSet[$tabbableSet.length - 1]) ||
    $tabbableSet.length === 0
  ) {
    e.preventDefault();
    if (
      $tabbableSet.length === 0 ||
      (isSingle && e.shiftKey && e.target === $tabbableSet[$tabbableSet.length - 1])
    ) {
      modal.focus();
    } else {
      const pos = e.shiftKey ? 'last' : 'first';
      $tabbableSet[pos]().focus();
    }
  }
}

function handleOverflowKlass($dialog, klass, isRemoving) {
  const bodyHasKlass = $body.hasClass(klass);
  const flag = isRemoving || false;

  if (flag ? bodyHasKlass : !bodyHasKlass) {
    $dialog.addClass(noTransitionKlass);
    $body.toggleClass(klass, !flag);
    setTimeout(() => {
      $dialog.removeClass(noTransitionKlass);
    }, 30);
  }
}
function handleScreenOverflow($modal) {
  const $dialog = $modal.find('.modal-dialog');
  const $content = $dialog.find('.modal-content');
  const winH = browser.isiOS
    ? getIOSWindowHeight() - (defaultIOSToolbarsHeight - getHeightOfIOSToolbars())
    : $win.height();
  const winW = $win.width();
  const isXOverflown = $content.outerWidth(true) >= winW;
  const isYOverflown = $content.outerHeight(true) >= winH;

  handleOverflowKlass($dialog, overflowYKlass, !isYOverflown);
  handleOverflowKlass($dialog, overflowXKlass, !isXOverflown);

  $($modal).trigger('overflow-handled.bs.modal');
}
function show($modal) {
  $modal.addClass(tempVisKlass);
  handleScreenOverflow($modal);
  $modal.removeClass(tempVisKlass);
  $modal.modal('show');
}
function hide($modal) {
  $modal.modal('hide');
}

const modalApi = { show, hide, handleScreenOverflow };

$doc
  .on('show.bs.modal', '.modal', function handler() {
    const $modal = $(this);
    const backdropShowTimeout = Modernizr.csstransitions ? backdropTransitionDuration : 0;

    $body.addClass(backdropShowStartKlass);

    if ($modal.hasClass(fullscreenModalKlass)) {
      $body.addClass(fullscreenKlass);
    }

    $modal.data('scroll-top', $win.scrollTop());

    onShowTID = setTimeout(() => {
      $body.addClass(`${dialogShowStartKlass} ${backdropShowEndKlass}`);

      // todo: Investigate if still necessary on mobile devices
      //  (initially this code was only for "touchscreens", became for everything because everything can support touch)
      // $win.scrollTop(0);
    }, backdropShowTimeout);
  })
  .on('shown.bs.modal', '.modal', function handler() {
    const $modal = $(this);

    if ($modal.is(':visible') && onShowTID) {
      $body.addClass(dialogShowEndKlass);

      if ($modal.hasClass(autocloseKlass)) {
        autocloseTID = setTimeout(() => {
          $modal.modal('hide');
        }, autocloseDelay);
      }
    }
  })
  .on('hide.bs.modal', '.modal', function handler(e) {
    const originalScrollTop = $(this).data('scroll-top');
    const hideTimeout = Modernizr.csstransitions ? dialogTransitionDuration / 2 : 0;

    clearTimeout(onShowTID);
    onShowTID = false;

    if ($(e.target).hasClass(autocloseKlass)) {
      clearTimeout(autocloseTID);
    }

    $body
      .addClass(dialogHideStartKlass)
      .removeClass(`${dialogShowStartKlass} ${dialogShowEndKlass}`);

    setTimeout(() => {
      $body.addClass(dialogHideEndKlass);
      setTimeout(() => {
        $body
          .removeClass(`${backdropShowStartKlass} ${backdropShowEndKlass}`)
          .addClass(backdropHideStartKlass);

        $win.scrollTop(originalScrollTop);
      }, 0);
    }, hideTimeout);
  })
  .on('hidden.bs.modal', '.modal', function handler() {
    $body.removeClass(
      `${backdropHideStartKlass} ${dialogHideEndKlass} ${dialogHideStartKlass} ${fullscreenKlass}`
    );
  })
  /* handle tabbing through :tabbable fields inside modal */
  .on('keydown.bs.modal', '.modal', function handler(e) {
    if (e.keyCode === 9) {
      // TAB
      watchTab(e, this);
    }
  })
  .on('content-update', '.modal', function handler() {
    const $that = $(this);
    $that.focus();
    handleScreenOverflow($that);
  });

/* general modal opening logic */
// .on('click', '[data-modal-trigger]', function handler(e) {
//   const $trigger = $(this);
//   const id = $trigger.attr('data-modal-trigger');
//   const $modal = $(`[data-modal="${id}"]`);
//
//   e.preventDefault();
//
//   if ($trigger.is('[data-dismiss="modal"]') && $body.hasClass(modalOpenKlass)) {
//     $doc.one('hidden.bs.modal', '.modal', () => {
//       show($modal);
//     });
//   } else {
//     show($modal);
//   }
// })

$win.on(
  'resize orientationchange',
  throttle(250, () => {
    handleScreenOverflow($('.modal.in'));
  })
);

export default modalApi;
