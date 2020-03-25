import enquire from 'enquire.js';
import numeral from 'numeral';
import 'numeral/locales/ru';

import App from '../app';
import { moveBlock, revertBlock } from '../services/lib/util/switch-dom-position';
import '../behaviors/product';
import '../services/store.t3';
import '../services/lib/deletable';
import initUpload from '../services/lib/upload';

App.addModule('basket', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  const namespace = '.module.basket';
  let moduleElem;
  let totalContainer;
  let totalDiscountedContainer;
  let basketUpload;
  let basketUploadHolder;
  const store = context.getService('store');
  const globalOptions = context.getGlobalConfig();
  const numeralOptions = globalOptions.options.numeral;

  const mq = [
    'screen and (max-width: 660px)',
    {
      match() {
        moveBlock($(basketUpload), $(basketUploadHolder));
      },
      unmatch() {
        revertBlock($(basketUpload));
      },
    },
  ];

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    behaviors: ['product'],
    messages: ['basket/quantity-change'],
    onmessage(name) {
      switch (name) {
        case 'basket/quantity-change':
          this.updateTotal();
          this.updateDiscountTotal();
          break;
        default:
          break;
      }
    },
    updateTotal() {
      totalContainer.innerHTML = numeral(store.basket.getTotal()).format(numeralOptions.format);
    },
    updateDiscountTotal() {
      totalDiscountedContainer.innerHTML = numeral(store.basket.getDiscountedTotal()).format(
        numeralOptions.format
      );
    },
    init() {
      moduleElem = context.getElement();
      basketUpload = moduleElem.querySelector('.basket-upload');
      basketUploadHolder = moduleElem.querySelector('.basket-upload-holder');
      totalContainer = moduleElem.querySelector('.js-basket__total');
      totalDiscountedContainer = moduleElem.querySelector('.js-basket__discounted-total');

      numeral.locale(globalOptions.locale);

      $(moduleElem.querySelectorAll('.deletable')).deletable();
      $(moduleElem).on(`deleted.comp.deletable${namespace}`, (e, data) => {
        store.basket.removeProduct(data.item.dataset.id);
      });

      initUpload($(moduleElem.querySelectorAll('.upload')), {
        url: 'server/php/',
        dataType: 'json',
      });

      /* prevent basket form from submitting on input enter press */
      $(document).on(
        `keypress${namespace}`,
        '.js-basket__form :input:not(textarea):not([type=submit])',
        (e) => {
          if (e.keyCode === 13) {
            e.preventDefault();
          }
        }
      );

      enquire.register(...mq);
    },
    destroy() {
      $(moduleElem).off(namespace);
      $(document).off(namespace);

      moduleElem = null;
      basketUpload = null;
      basketUploadHolder = null;

      enquire.unregister(...mq);
    },
  };
});
