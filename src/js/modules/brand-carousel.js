import App from '../app';
import BrandCarousel from '../services/brand-carousel';

App.addModule('brand-carousel', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  let brandCarousel;
  let $element;

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    init() {
      $element = $(context.getElement());
      brandCarousel = BrandCarousel.create($element);
      brandCarousel.init();
    },
    destroy() {
      $element = null;
      brandCarousel.destroy();
    },
  };
});
