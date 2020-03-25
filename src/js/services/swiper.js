import { debounce } from 'throttle-debounce';
import 'fotorama/fotorama';
import 'fotorama/fotorama.css';

const instances = [];

function handleResize() {
  $.each(instances, (i, instance) => {
    if (instance.isInited) {
      if ($(instance.element).is(':visible')) {
        instance.resetHeight();
      } else {
        instances[i].needsReset = true;
      }
    } else if ($(instance.element).is(':visible')) {
      instance.init();
    }
  });
}

function getTallestHeight($gal) {
  let tallest = 0;
  const api = $gal.data('fotorama');
  const $items = api ? api.data : $gal.children();

  $.each($items, function () {
    const $elem = api ? $(this.html).clone() : $(this);
    let $hostFrame;
    let h;
    const utilKlass = 'is-utilized';

    if (api) {
      api.resize();
      $hostFrame = api.activeFrame.$stageFrame.siblings().eq(0).addClass(utilKlass);
      h = $elem.prependTo($hostFrame.find('.fotorama__html')).height();
      $elem.remove();
      $hostFrame.removeClass(utilKlass);
    } else {
      h = $elem.height();
    }

    if (h > tallest) {
      tallest = h;
    }
  });

  return tallest;
}

function catchFrame($fotorama, $frame) {
  setTimeout(() => {
    $fotorama.resize({ height: $('.fotorama__html > *', $frame).height() }, 200);
  }, 1);
}

function Swiper(element, options) {
  this.element = element;
  this.options = options;
  this.isInited = false;
  this.needsReset = false;
}
Swiper.prototype.init = function init() {
  const $swiper = $(this.element);

  if (!$swiper.is(':visible')) {
    throw new Error('Element should be visible to properly initialize');
  }

  const options = $.extend(
    true,
    {
      click: false,
      width: '100%',
      height: $swiper.attr('data-swiper-height') === 'tallest' ? getTallestHeight($swiper) : null,
    },
    this.options
  );
  if ($swiper.attr('data-swiper-height') === 'auto') {
    $swiper.on('fotorama:showend', function (e, fotorama) {
      const $frame = fotorama.activeFrame.$stageFrame;

      if (!$frame.data('state')) {
        $frame.on('f:load f:error', function () {
          if (fotorama.activeFrame.$stageFrame === $frame) {
            catchFrame(fotorama, $frame);
          }
        });
      } else {
        catchFrame(fotorama, $frame);
      }
    });
  }
  $swiper.fotorama(options);

  this.isInited = true;
};
Swiper.prototype.destroy = function destroy() {
  $(this.element).off('fotorama:showend').data('fotorama').destroy();
};
Swiper.prototype.resetHeight = function resetHeight() {
  const $gal = $(this.element);
  const api = $gal.data('fotorama');

  if (api) {
    api.resize({
      height: getTallestHeight($gal),
    });

    this.needsReset = false;
  }
};

$(window).on('resize', debounce(100, handleResize)).on('orientationchange', handleResize);

export default {
  create($elements, options) {
    const currentInstances = [];

    $.each($elements, (i, element) => {
      currentInstances.push(new Swiper(element, options));
    });
    Array.prototype.push.apply(instances, currentInstances);

    return currentInstances.length === 1 ? currentInstances[0] : currentInstances;
  },
};
