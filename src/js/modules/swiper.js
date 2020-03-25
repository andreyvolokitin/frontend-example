import App from '../app';
import Swiper from '../services/swiper';

App.addModule('swiper', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  let swiper;
  let $element;

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    onmessage: {
      fontsactive() {
        swiper.resetHeight();
      },
      producttabactivate(data) {
        if (!swiper.isInited && data.ui.newPanel.find($element).length) {
          swiper.init();
        }

        if (swiper.needsReset) {
          swiper.resetHeight();
        }
      },
    },
    init() {
      $element = $(context.getElement());
      swiper = Swiper.create($element);

      if ($element.is(':visible')) {
        swiper.init();
      }
    },
    destroy() {
      $element = null;
      swiper.destroy();
    },
  };
});
