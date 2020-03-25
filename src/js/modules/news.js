import enquire from 'enquire.js';

import App from '../app';
import { moveBlock, revertBlock } from '../services/lib/util/switch-dom-position';

App.addModule('news', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  // const eventNamespace = '.module.news';
  let $news;
  let $newsHolder;

  const mq = [
    'screen and (max-width: 1150px)',
    {
      match() {
        moveBlock($news, $newsHolder);
      },
      unmatch() {
        revertBlock($news);
      },
    },
  ];

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    init() {
      $news = $(context.getElement());
      $newsHolder = $('.news-holder');

      enquire.register(...mq);
    },
    destroy() {
      $news = null;
      $newsHolder = null;

      enquire.unregister(...mq);
    },
  };
});
