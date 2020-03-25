import App from '../app';
import ContentSlider from '../services/content-slider';

App.addModule('content-slider', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------
  let contentSlider;

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    init() {
      contentSlider = ContentSlider.create($(context.getElement()));
      contentSlider.init();
    },
    destroy() {
      contentSlider.destroy();
    },
  };
});
