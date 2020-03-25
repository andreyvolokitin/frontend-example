import enquire from 'enquire.js';

import App from '../app';
import { moveBlock, revertBlock } from '../services/lib/util/switch-dom-position';

App.addModule('banner', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  // const eventNamespace = '.module.banner';
  let $banner;
  let $bannerHolder;

  const mq = [
    'screen and (max-width: 840px)',
    {
      match() {
        moveBlock($banner, $bannerHolder);
      },
      unmatch() {
        revertBlock($banner);
      },
    },
  ];

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    init() {
      $banner = $(context.getElement());
      $bannerHolder = $('.banner-holder');

      enquire.register(...mq);
    },
    destroy() {
      $banner = null;
      $bannerHolder = null;

      enquire.unregister(...mq);
    },
  };
});
