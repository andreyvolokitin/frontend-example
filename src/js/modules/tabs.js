import App from '../app';
import Tabs from '../services/lib/tabs';

App.addModule('tabs', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  let tabs;
  let $element;

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    init() {
      $element = $(context.getElement());
      tabs = Tabs.create($element);
      tabs.init();
    },
    destroy() {
      $element = null;
      tabs.destroy();
    },
  };
});
