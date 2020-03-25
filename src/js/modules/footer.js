import { debounce } from 'throttle-debounce';
import App from '../app';

App.addModule('footer', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  const eventNamespace = '.module.footer';
  let $win;
  let $footer;
  let $content;
  let $footCat;
  let isFontsActive = false;
  let isFooterColumnized = false;
  let columnizerPromise;

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

        if (Modernizr.csscolumns.width) {
          this.fit();
        }
      },
    },
    fit() {
      if ($footer.is(':visible')) {
        $content.css('paddingBottom', $footer.outerHeight());
      }
    },
    columnize() {
      if (Modernizr.csscolumns.width || isFooterColumnized) {
        return;
      }

      $footCat.columnize({
        width: parseInt($footCat.find('.fcat__item').eq(0).css('maxWidth'), 10),
      });
      isFooterColumnized = true;
      this.fit();
    },
    init() {
      if (columnizerPromise) {
        columnizerPromise.then(() => {
          if (isFontsActive && !isFooterColumnized) {
            this.columnize();
          }
        });
      }

      $win = $(window);
      $footer = $(context.getElement());
      $content = $('.content');
      $footCat = $footer.find('.fcat');
      this.fit();

      $win
        .on(`orientationchange${eventNamespace}`, this.fit)
        .on(`resize${eventNamespace}`, debounce(Modernizr.csscolumns.width ? 50 : 250, this.fit));
    },
    destroy() {
      $win.off(eventNamespace);
      $win = null;
      $footer = null;
      $content = null;
      $footCat = null;
    },
  };
});
