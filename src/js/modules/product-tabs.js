import enquire from 'enquire.js';

import App from '../app';
import Tabs from '../services/lib/tabs';

App.addModule('product-tabs', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  // const eventNamespace = '.module.product-tabs';
  let tabs;
  let $element;

  const mq = [
    'screen and (max-width: 600px)',
    {
      match() {
        tabs = Tabs.create($element, {
          activate(e, ui) {
            context.broadcast('producttabactivate', { ui });
          },
        });
        tabs.init();
      },
      unmatch() {
        tabs.destroy();
      },
    },
  ];

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    init() {
      $element = $(context.getElement());

      enquire.register(...mq);
    },
    destroy() {
      $element = null;

      if (tabs) {
        tabs.destroy();
      }

      enquire.unregister(...mq);
    },
  };
});
