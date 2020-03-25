import enquire from 'enquire.js';

import App from '../app';
import { moveBlock, revertBlock } from '../services/lib/util/switch-dom-position';
import request from '../services/lib/util/request';
import initExpand from '../services/lib/expand';
import initRange from '../services/lib/range';

App.addModule('filter', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  const eventNamespace = '.module.filter';
  let $filter;
  let $filterHolder;
  let $form;

  const mq = [
    'screen and (max-width: 840px)',
    {
      match() {
        moveBlock($filter, $filterHolder);
      },
      unmatch() {
        revertBlock($filter);
      },
    },
  ];

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    init() {
      $filter = $(context.getElement());
      $filterHolder = $('.filter-holder');
      $form = $filter.find('.js-filter__form');

      $form.on(`submit${eventNamespace}`, (e) => {
        e.preventDefault();
        this.submit();
      });

      initExpand($filter[0].querySelectorAll('.exp'));
      initRange($filter.find('.range'));

      enquire.register(...mq);
    },
    submit() {
      request(
        () =>
          $.ajax({
            // url: 'erf',
            url: 'https://httpbin.org/get',
            // url: '',
          }),
        {
          target: $form[0],
          allowConcurrent: true,
        }
      ).then(
        (response) => {
          console.log('normal usage success', response);
        },
        (error) => {
          console.log('normal usage fail', error);
        }
      );
    },
    destroy() {
      $filter = null;
      $filterHolder = null;
      $form.off(eventNamespace);
      $form = null;

      enquire.unregister(...mq);
    },
  };
});
