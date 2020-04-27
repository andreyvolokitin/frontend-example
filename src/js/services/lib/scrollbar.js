import baron from 'baron';
import { debounce } from 'throttle-debounce';

// https://github.com/Diokuz/baron/issues/110#issuecomment-596198772
const scrollKlass = 'scroll';
const nonrootKlass = `${scrollKlass}_nonroot`;
const horizontalKlass = `${scrollKlass}_h`;
const verticalKlass = `${scrollKlass}_v`;
const scrollerKlass = `${scrollKlass}__scroller`;
const barKlass = `${scrollKlass}__bar`;
const trackKlass = `${scrollKlass}__track`;

const overflownXKlass = '_scrollbar-h';
const overflownYKlass = '_scrollbar-v';

function getOverflown(element) {
  return {
    x: element.scrollWidth > element.clientWidth,
    y: element.scrollHeight > element.clientHeight,
  };
}

/**
 * For vertical scroll, set height to root element, not scroller.
 * Only use `$scrollElement` as a `root` (to support `-webkit-overflow-scrolling`, also https://github.com/Diokuz/baron/issues/184)
 */

// https://github.com/Diokuz/baron/blob/master/docs/api.md
function initCustomScrollbars($scrollElements) {
  $.each($scrollElements, (i, scroll) => {
    const scroller = scroll.querySelector(`.${scrollerKlass}`);
    const root = scroll.matches(`.${nonrootKlass}`) ? scroller : scroll;
    const isHorizontalOnly = scroll.matches(`.${horizontalKlass}:not(.${verticalKlass})`);
    const defaults = {
      root,
      scroller,
      // https://github.com/Diokuz/baron/issues/113
      // https://github.com/Diokuz/baron/issues/96#issuecomment-147070878
      impact: isHorizontalOnly ? 'clipper' : 'scroller',
      resizeDebounce: 0,
      cssGuru: true,
      direction: isHorizontalOnly ? 'h' : 'v',
      bar: isHorizontalOnly ? `.${barKlass}._h` : `.${barKlass}._v`,
      track: isHorizontalOnly ? `.${trackKlass}._h` : `.${trackKlass}._v`,
    };
    const baronData = {};
    // detect overflow, because baron is buggy: https://github.com/Diokuz/baron/issues/184
    const overflow = getOverflown(scroller);

    if (overflow.x) {
      root.classList.add(overflownXKlass);
    }
    if (overflow.y) {
      root.classList.add(overflownYKlass);
    }

    baronData[defaults.direction] = baron(defaults);

    if (scroll.matches(`.${verticalKlass}.${horizontalKlass}`)) {
      baronData.h = baron(
        $.extend({}, defaults, {
          bar: `.${barKlass}._h`,
          track: `.${trackKlass}._h`,
          direction: 'h',
        })
      );
    }

    $(scroll).data('baron', baronData);
    root.classList.remove(overflownXKlass);
    root.classList.remove(overflownYKlass);
  });
}
$(window).on(
  'fontsactive resize orientationchange',
  // baron "auto-refresh" isn't good enough (buggy)
  debounce(300, () => {
    $.each($(`.${scrollKlass}`), (i, el) => {
      const baronData = $(el).data('baron');

      if (baronData) {
        Object.keys(baronData).forEach((baronInstance) => baronData[baronInstance].update());
      }
    });
  })
);
$(document).on('content-update', `.${scrollKlass}`, (e) => {
  const { currentTarget } = e;
  const baronData = $(currentTarget).data('baron');

  if (baronData) {
    Object.keys(baronData).forEach((baronInstance) => baronData[baronInstance].update());
  }
});

export default initCustomScrollbars;
