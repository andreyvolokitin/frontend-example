import enquire from 'enquire.js';

import App from '../app';
import { moveBlock, revertBlock } from '../services/lib/util/switch-dom-position';

App.addModule('catalog-menu', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  const eventNamespace = '.module.catalog-menu';
  const toggledKlass = 'cat_toggled';
  let $win;
  let $cat;
  let $catContent;
  let $catHolder;
  let $catTrigger;
  let $catSearchTrigger;
  let isFontsActive = false;
  let isCatColumnized = false;
  let columnizerPromise;

  const mq = [
    'screen and (max-width:840px)',
    {
      match() {
        moveBlock($cat, $catHolder);
        $catContent.addClass('cat__content_columnized');
      },
      unmatch() {
        revertBlock($cat);
      },
    },
  ];

  if (!Modernizr.csscolumns.width) {
    columnizerPromise = import(/* webpackChunkName: "jquery-columnizer" */ 'jquery-columnizer');
  }

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    onmessage: {
      fontsactive() {
        isFontsActive = true;

        if ($.fn.columnize) {
          this.columnize();
        }
      },
    },
    toggle() {
      $cat.toggleClass(toggledKlass);
      $win.trigger('resize');
    },
    openForSearch() {
      const isCatToggled = $cat.hasClass(toggledKlass);

      if (!isCatToggled) {
        $cat.addClass(toggledKlass);
        $win.trigger('resize');
        $catTrigger.button('toggle', true);
      }

      $cat.find('.js-catalog-menu__searchfield').focus();
    },
    columnize() {
      const initingKlass = 'cat_initing';

      if (Modernizr.csscolumns.width || isCatColumnized) {
        return;
      }
      if ($cat.is(':hidden')) {
        $cat.addClass(initingKlass);
      }
      $catContent.columnize({
        width: parseInt($catContent.find('.cat__item').eq(0).css('maxWidth'), 10),
      });
      $cat.removeClass(initingKlass);
      isCatColumnized = true;
    },
    init() {
      if (columnizerPromise) {
        columnizerPromise.then(() => {
          if (isFontsActive && !isCatColumnized) {
            this.columnize();
          }
        });
      }

      $win = $(window);
      $cat = $(context.getElement());
      $catContent = $cat.find('.cat__content');
      $catHolder = $('.cat-holder');
      $catTrigger = $('.js-catalog-menu__trigger');
      $catSearchTrigger = $('.js-catalog-menu__search');

      $catTrigger.on(`click${eventNamespace}`, this.toggle);
      $catSearchTrigger.on(`click${eventNamespace}`, this.openForSearch);

      enquire.register(...mq);
    },
    destroy() {
      $catTrigger.add($catSearchTrigger).off(eventNamespace);
      $win = null;
      $cat = null;
      $catContent = null;
      $catHolder = null;
      $catTrigger = null;
      $catSearchTrigger = null;

      enquire.unregister(...mq);
    },
  };
});
