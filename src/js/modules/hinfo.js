import enquire from 'enquire.js';

import App from '../app';
import { moveBlock, revertBlock } from '../services/lib/util/switch-dom-position';

App.addModule('hinfo', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  let $hinfo;
  let $hinfoHolder;
  let $hinfoHolder1;
  let isMobileBreakpoint = false;

  const mq = [
    'screen and (max-width: 660px)',
    {
      match() {
        isMobileBreakpoint = true;
        moveBlock($hinfo, $hinfoHolder1);
      },
      unmatch() {
        isMobileBreakpoint = false;
        revertBlock($hinfo);
      },
    },
  ];

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    onmessage: {
      navfit(data) {
        this.accomodate(data.overflown);
      },
    },
    init() {
      $hinfo = $(context.getElement());
      $hinfoHolder = $('.hinfo-holder');
      $hinfoHolder1 = $('.hinfo-holder1');

      enquire.register(...mq);
    },
    accomodate(accomodate) {
      if (!isMobileBreakpoint) {
        if (accomodate) {
          moveBlock($hinfo, $hinfoHolder);
        } else {
          revertBlock($hinfo);
        }
      }
    },
    destroy() {
      $hinfo = null;
      $hinfoHolder = null;
      $hinfoHolder1 = null;

      enquire.unregister(...mq);
    },
  };
});
