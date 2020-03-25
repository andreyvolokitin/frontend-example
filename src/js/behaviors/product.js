import numeral from 'numeral';
import 'numeral/locales/ru';
import tmpl from 'resig';

import App from '../app';
import '../services/store.t3';
import '../services/data.t3';
import commonUi from '../services/lib/util/common-ui';
import initTooltip from '../services/lib/tooltip';
import '../services/lib/numspin';

App.addBehavior('product', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  const namespace = '.behavior.product';
  const store = context.getService('store');
  const projectData = context.getService('data');
  let moduleElem;

  const productKlass = 'js-prod';
  const buyBtnKlass = `${productKlass}__buy-btn`;
  const compareBtnKlass = `${productKlass}__comp-btn`;
  const boughtCounterKlass = `${productKlass}__counter`;
  const boughtVolumeKlass = `${productKlass}__vol`;
  const boughtSumKlass = `${productKlass}__sum`;
  const preliminaryCounterKlass = `${productKlass}__precounter`;
  const preliminarySumKlass = `${productKlass}__presum`;
  const adjusterKlass = 'js-prod-adjuster';

  const globalOptions = context.getGlobalConfig();
  const numeralOptions = globalOptions.options.numeral;

  // const productDeleteKlass = `${productKlass}__delete`;

  /**
   * Get product elements inside module element by product id
   * @param pid
   * @returns {Array} - product element(s)
   */
  function getProductElements(pid) {
    let products;
    const productSelector = `.${productKlass}[data-id="${pid}"]`;

    if (moduleElem.matches(productSelector)) {
      products = [moduleElem];
    } else {
      products = Array.prototype.slice.call(moduleElem.querySelectorAll(productSelector));
    }

    return products;
  }

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    messages: ['compare/add', 'compare/remove', 'basket/quantity-change', 'comparelist-scrolled'],
    onmessage(name, data) {
      switch (name) {
        case 'compare/add':
        case 'compare/remove':
          this.toggleCompareButtons(data.pid, store.compare.getPresence(data.pid));
          break;
        case 'basket/quantity-change':
          this.updateBoughtCounter(data.pid);
          this.updateBoughtVol(data.pid);
          this.updateBoughtSum(data.pid);
          break;
        case 'comparelist-scrolled':
          this.hideOpenedAdjusters();
          break;
        default:
          break;
      }
    },
    toggleCompareButtons(pid, isToggled) {
      const products = getProductElements(pid);

      products.forEach((elem) => {
        elem
          .querySelectorAll(`.${compareBtnKlass}`)
          .forEach((btn) => $(btn).button('toggle', isToggled));
      });
    },
    /* set the quantity to be bought by a specific product buy button */
    setBuyingQuantity(product, quantity) {
      product.querySelectorAll(`.${buyBtnKlass}`).forEach((el) => {
        // eslint-disable-next-line no-param-reassign
        el.dataset.quantity = quantity;
      });
    },
    /* update preliminary sum for specific product to be bought */
    updatePreliminarySum(product, quantity) {
      const pID = product.dataset.id.trim();
      const container = product.querySelector(`.${preliminarySumKlass}`);

      if (container) {
        container.innerHTML = numeral(store.data.getProductPrice(pID) * quantity).format(
          numeralOptions.format
        );
      }
    },
    update(pid, cb, element) {
      let products;

      if (element) {
        products = [element];
      } else {
        products = getProductElements(pid);
      }

      products.forEach(cb);
    },
    /* update in-basket product counter in multiple places */
    updateBoughtCounter(pid, element) {
      this.update(
        pid,
        (elem) => {
          const quantityElem = elem.querySelector(`.${boughtCounterKlass}`);

          if (quantityElem) {
            quantityElem[
              quantityElem.matches('input') ? 'value' : 'textContent'
            ] = store.basket.getProductQuantity(pid);
          }
        },
        element
      );
    },
    /* update in-basket product volume in multiple places */
    updateBoughtVol(pid, element) {
      this.update(
        pid,
        (elem) => {
          const volumeElem = elem.querySelector(`.${boughtVolumeKlass}`);

          if (volumeElem) {
            volumeElem.innerHTML = store.basket.getProductUnits(pid);
          }
        },
        element
      );
    },
    updateBoughtSum(pid, element) {
      this.update(
        pid,
        (elem) => {
          const sumElem = elem.querySelector(`.${boughtSumKlass}`);

          if (sumElem) {
            sumElem.innerHTML = numeral(store.basket.getProductTotal(pid)).format(
              numeralOptions.format
            );
          }
        },
        element
      );
    },
    showQuantityAdjuster($targetBtn, pid) {
      // eslint-disable-next-line no-underscore-dangle
      let tooltip = $targetBtn[0]._tippy;

      if (!tooltip) {
        tooltip = initTooltip($targetBtn[0], {
          appendTo: moduleElem,
          content: tmpl('prod_adjuster', store.data.getProduct(pid)),
          theme: 'adjuster',
          onCreate(instance) {
            instance.popper.classList.add(adjusterKlass);
          },
        });
        commonUi(tooltip.popper);
        this.localUi(tooltip.popper);
      } else {
        this.updateBoughtCounter(pid, tooltip.popper);
        this.updateBoughtVol(pid, tooltip.popper);
      }

      tooltip.show();
    },
    showBuyedMsg(pid) {
      const $msg = $(tmpl('buyed_msg', store.data.getProduct(pid))).appendTo('body');
      const activeKlass = 'is-active';
      const msgTimeout = 3000;

      setTimeout(() => $msg.addClass(activeKlass), 40);
      setTimeout(function () {
        $msg.removeClass(activeKlass);
        setTimeout(function () {
          $msg.remove();
        }, 400);
      }, msgTimeout);
    },
    localUi(elem) {
      $(elem).find('.numspin').numspin();
    },
    hideOpenedAdjusters() {
      document.querySelectorAll(`.${adjusterKlass}`).forEach((adjuster) => {
        // eslint-disable-next-line no-underscore-dangle
        const tippy = adjuster._tippy;

        if (tippy) {
          tippy.hide();
        }
      });
    },
    init() {
      const that = this;
      const behaviorData = projectData.get(namespace);

      moduleElem = context.getElement();
      numeral.locale(globalOptions.locale);
      this.localUi(moduleElem);

      if (!behaviorData || !behaviorData.globalEventsBound) {
        $(document).on(`mousedown${namespace} touchstart${namespace}`, (e) => {
          const buyBtnTarget = e.target.closest(`.${buyBtnKlass}`);
          const adjusterTarget = e.target.closest(`.${adjusterKlass}`);
          const openedAdjuster = document.querySelector(`.${adjusterKlass}`);

          if (
            (!buyBtnTarget ||
              // eslint-disable-next-line no-underscore-dangle
              !buyBtnTarget._tippy ||
              // eslint-disable-next-line no-underscore-dangle
              buyBtnTarget._tippy.popper !== openedAdjuster) &&
            !adjusterTarget
          ) {
            that.hideOpenedAdjusters();
          }
        });
        projectData.set(namespace, {
          globalEventsBound: true,
        });
      }

      $(moduleElem)
        .on(`click${namespace}`, `.${buyBtnKlass}, .${compareBtnKlass}`, (e) => e.preventDefault())
        .on(`num-entered${namespace}`, `.${boughtCounterKlass}`, function () {
          store.basket.setProductQuantity(
            this.closest(`.${productKlass}`).dataset.id.trim(),
            this.value
          );
        })
        .on(`num-entered${namespace}`, `.${preliminaryCounterKlass}`, function () {
          const product = this.closest(`.${productKlass}`);

          that.setBuyingQuantity(product, +this.value);
          that.updatePreliminarySum(product, +this.value);
        })
        .on(`click${namespace}`, `.${buyBtnKlass}`, function () {
          const pID = this.closest(`.${productKlass}`).dataset.id.trim();

          store.basket.increaseProduct(pID, this.dataset.quantity || 1);
          that.showQuantityAdjuster($(this), pID);
          that.showBuyedMsg(pID);
        })
        .on(`click${namespace}`, `.${compareBtnKlass}`, function () {
          if (!store.data.ready()) {
            $(this).button('preventStateChange');
          }
        })
        .on(`toggled.comp.button${namespace}`, `.${compareBtnKlass}`, function (e, data) {
          const pID = this.closest(`.${productKlass}`).dataset.id.trim();

          store.compare.setPresence(pID, data.isToggled);
        });
    },
    destroy() {
      $(moduleElem).off(namespace);
      moduleElem = null;
    },
  };
});
