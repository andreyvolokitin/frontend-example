import 'fotorama/fotorama';
import 'fotorama/fotorama.css';

function Slider(element, options) {
  this.element = element;
  this.options = options;
}
Slider.prototype.init = function init() {
  const $element = $(this.element);
  const $slides = $element.children();
  const data = [];

  $.each($slides, function () {
    const $slide = $(this);

    data.push({
      img: $slide.attr('data-img'),
      html: $slide.html(),
    });
  });

  $element.fotorama({
    data,
    nav: false,
    width: '100%',
    autoplay: 5000,
    // stopautoplayontouch: false,
  });
};
Slider.prototype.destroy = function destroy() {
  $(this.element).data('fotorama').destroy();
};

export default {
  create($elements, options) {
    const currentInstances = [];

    $.each($elements, (i, element) => {
      currentInstances.push(new Slider(element, options));
    });

    return currentInstances.length === 1 ? currentInstances[0] : currentInstances;
  },
};
