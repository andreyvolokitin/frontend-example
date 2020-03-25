import App from '../app';
import '../services/store.t3';

App.addModule('product-badge', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  let store;
  let badge;
  let badgeType;
  let badgeValueElem;
  const badgeLimit = 999;

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    messages: ['basket/quantity-change', 'compare/add', 'compare/remove'],
    onmessage(name) {
      switch (name) {
        case 'basket/quantity-change':
          if (badgeType === 'basket') {
            this.updateQuantity(store.basket.getQuantity());
          }
          break;
        case 'compare/add':
        case 'compare/remove':
          if (badgeType === 'compare') {
            this.updateQuantity(store.compare.getQuantity());
          }
          break;
        default:
          break;
      }
    },
    updateQuantity(qnt) {
      badgeValueElem.innerHTML = qnt > badgeLimit ? `${badgeLimit}+` : qnt;
    },
    init() {
      store = context.getService('store');
      badge = context.getElement();
      badgeType = badge.dataset.type;
      badgeValueElem = badge.querySelector('.js-product-badge__val');
    },
    destroy() {
      store = null;
      badge = null;
      badgeValueElem = null;
    },
  };
});
