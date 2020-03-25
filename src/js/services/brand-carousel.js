import 'slick-carousel';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function BrandCarousel(element, options) {
  this.element = element;
  this.options = options;
}
BrandCarousel.prototype.init = function init() {
  const $element = $(this.element);

  $element.slick({
    swipeToSlide: true,
    slidesToShow: $element.data('slides') || 4,
    respondTo: 'slider',
    responsive: [
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 200,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  });
};
BrandCarousel.prototype.destroy = function destroy() {
  $(this.element).slick('unslick');
};

export default {
  create($elements, options) {
    const currentInstances = [];

    $.each($elements, (i, element) => {
      currentInstances.push(new BrandCarousel(element, options));
    });

    return currentInstances.length === 1 ? currentInstances[0] : currentInstances;
  },
};
