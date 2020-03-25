import App from '../app';
import Tabs from '../services/lib/tabs';

App.addBehavior('tabs', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  // const eventNamespace = '.behavior.tabs';
  let tabs;

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    init() {
      tabs = Tabs.create($(context.getElement()));
      tabs.init();
    },
    destroy() {
      tabs.destroy();
    },
  };
});
