import enquire from 'enquire.js';
import 'fotorama/fotorama';
import 'fotorama/fotorama.css';

function setSliderNavOption(element, value) {
  $.each($(element), (i, el) => {
    const api = $(el).data('fotorama');

    if (api) {
      api.setOptions({
        nav: value,
      });
    }
  });
}
function createMq(element) {
  return [
    'screen and (max-width:660px)',
    {
      match() {
        setSliderNavOption(element, 'dots');
      },
      unmatch() {
        setSliderNavOption(element, false);
      },
    },
  ];
}

/**
 * Content slider.
 * @param element - widget element.
 * @param options - custom options for fotorama: https://fotorama.io/docs/4/
 * @constructor
 */
function ContentSlider(element, options) {
  const mq = createMq(element);

  this.element = element;
  this.options = options;
  this.getMq = function getMq() {
    return mq;
  };
}
ContentSlider.prototype.init = function init() {
  const $slider = $(this.element);
  const sliderOptions = $.extend(
    true,
    {
      nav: false,
      width: '100%',
      allowfullscreen: true,
      captions: true,
    },
    this.options
  );

  $slider
    .on('fotorama:fullscreenenter fotorama:fullscreenexit', (e, fotorama) => {
      if (e.type === 'fotorama:fullscreenenter') {
        // Options for the fullscreen
        fotorama.setOptions({ fit: 'scaledown' });
      } else {
        // Back to normal settings
        fotorama.setOptions({ fit: 'contain' });
      }
    })
    .fotorama(sliderOptions);

  enquire.register(...this.getMq());
};

ContentSlider.prototype.destroy = function destroy() {
  $(this.element)
    .off('fotorama:fullscreenenter fotorama:fullscreenexit')
    .data('fotorama')
    .destroy();

  enquire.unregister(...this.getMq());
};

ContentSlider.prototype.reset = function reset() {
  $(this.element).data('fotorama').resize();
};

export default {
  create($elements, options) {
    const currentInstances = [];

    $.each($elements, (i, element) => {
      currentInstances.push(new ContentSlider(element, options));
    });

    return currentInstances.length === 1 ? currentInstances[0] : currentInstances;
  },
};
