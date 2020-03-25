import enquire from 'enquire.js';

import App from '../app';
import { moveBlock, revertBlock } from '../services/lib/util/switch-dom-position';

App.addModule('office', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  // const eventNamespace = '.module.office';
  let $office;
  let $officeHolder;

  const mq = [
    'screen and (max-width: 840px)',
    {
      match() {
        moveBlock($office, $officeHolder);
      },
      unmatch() {
        revertBlock($office);
      },
    },
  ];

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    init() {
      $office = $(context.getElement());
      $officeHolder = $('.office-holder');

      enquire.register(...mq);
    },
    destroy() {
      $office = null;
      $officeHolder = null;

      enquire.unregister(...mq);
    },
  };
});
