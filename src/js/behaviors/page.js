// import WebFont from 'webfontloader';
import FastClick from 'fastclick';
import enquire from 'enquire.js';
import FontFaceObserver from 'fontfaceobserver/fontfaceobserver.standalone';

import App from '../app';
import formValidator from '../services/lib/util/form-validator';
import swipeDetector from '../services/lib/util/swipe-detector';
import { hideUrlBarOnLoad, enableIOSActive } from '../services/lib/util/mobile-boilerplate';
import commonUi from '../services/lib/util/common-ui';
import { validationHook } from '../services/lib/util/form-validity';
import resetFormElements from '../services/lib/util/reset-form-elements';
import '../services/lib/util/textarea-resize';
import '../services/util/refresh';
import initFixedBlocks from '../services/lib/fixed-block';

App.addBehavior('page', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------
  const eventNamespace = '.module.page';
  const $fixedBlocks = $('.js-fixed-block');

  const mq = [
    'screen and (max-width: 1050px)',
    {
      match() {
        $fixedBlocks.trigger('sticky_kit:detach');
      },
      unmatch() {
        initFixedBlocks($fixedBlocks);
      },
    },
  ];

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    onmessage: {
      fontsactive() {
        $('.select').select('handleWidth');
      },
      dataavailable() {
        console.log('data available');
      },
      dataunavailable() {
        console.log('data not available');
      },
    },
    init() {
      Promise.all([
        new FontFaceObserver('pt_sans').load(),
        new FontFaceObserver('pf_dindisplay_pro').load(),
      ]).then(
        () => {
          document.documentElement.className += ' wf-active';
          context.broadcast('fontsactive');
          $(window).trigger('fontsactive');
        },
        (error) => {
          console.log(error);
        }
      );
      // WebFont.load({
      //   custom: {
      //     families: ['pf_dindisplay_pro', 'pt_sans'],
      //   },
      //   active() {
      //     context.broadcast('fontsactive');
      //     $(window).trigger('fontsactive');
      //   },
      //   fontinactive() {
      //     context.broadcast('fontsinactive');
      //     $(window).trigger('fontsinactive');
      //   },
      // });
      formValidator.init($(`.${validationHook}`));
      swipeDetector.init();

      $(document).on(`reset${eventNamespace}`, 'form', (e) => {
        resetFormElements($(e.target));
      });

      // http://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
      $('.wrapper').on('click', () => {});

      commonUi(document);
      hideUrlBarOnLoad();
      enableIOSActive();
      FastClick.attach(document.body);
      initFixedBlocks($fixedBlocks);

      enquire.register(...mq);
    },
    destroy() {
      $(document).off(`reset${eventNamespace}`);
      enquire.unregister(...mq);
    },
  };
});
