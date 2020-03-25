import enquire from 'enquire.js';

import App from '../app';
import Slider from '../services/slider';
import { moveBlock, revertBlock } from '../services/lib/util/switch-dom-position';

App.addModule('slider', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  let slider;
  let $mainSlider;
  let $mainSliderHolder;

  const mq = [
    'screen and (max-width:660px)',
    {
      match() {
        moveBlock($mainSlider, $mainSliderHolder);
      },
      unmatch() {
        revertBlock($mainSlider);
      },
    },
  ];

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    init() {
      $mainSlider = $(context.getElement());
      $mainSliderHolder = $('.main-slider-holder');
      slider = Slider.create($mainSlider);
      slider.init();

      enquire.register(...mq);
    },
    destroy() {
      $mainSlider = null;
      $mainSliderHolder = null;
      slider.destroy();

      enquire.unregister(...mq);
    },
  };
});
