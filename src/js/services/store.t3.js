import 'proxy-polyfill/proxy.min';
import { debounce } from 'throttle-debounce';
import { filter } from 'lodash-es';
import isSafeInteger from 'is-safe-integer';

import App from '../app';

App.addService('store', (app) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  const store = {};
  let storeData = false;
  let onpageProducts;
  const sync = debounce(200, (topic, data) => {
    console.log(`${topic}: ${JSON.stringify(data)}`);
    /*
     * Функция синхронизации с сервером после любых изменений в коллекциях (корзина, список сравнения).
     * topic - имя события в формате коллекция/действие (compare/remove, basket/quantity-change);
     *
     * TODO: при возврате AJAX-запросом ошибки - сохранить изменения в localStorage
     * TODO: при наличии в localStorage несохранённых данных - делать попытки синхронизации с некоторым интервалом
     * TODO: после успешной синхронизации очистить данные в localStorage
     * TODO: если страница была перезагружена со старыми данными, и только потом произошла синхронизация - изменить состояние интерфейса на клиенте в соответствии с данными, находившимися в localStorage до синхронизации
     * */
  });

  // function addDataIfUnique(data) {
  //   assign(onpageProducts, data, (localProductData, incomingProductData) => {
  //     if (localProductData === undefined) {
  //       return incomingProductData;
  //     }
  //
  //     return localProductData.id === incomingProductData.id
  //       ? localProductData
  //       : incomingProductData;
  //   });
  // }
  // function removeData(ids) {
  //   const idsArr = [];
  //
  //   if (!Array.isArray(ids)) {
  //     idsArr.push(ids);
  //   } else {
  //     [].push.apply(idsArr, ids);
  //   }
  //
  //   idsArr.forEach(id => delete onpageProducts[id]);
  // }
  function Data() {}
  Data.prototype = {
    constructor: Data,
    getProduct(pid) {
      return storeData.onpageProducts[pid];
    },
    getProductPrice(pid) {
      return storeData.onpageProducts[pid].price;
    },
    ready() {
      return typeof storeData === 'object';
    },
  };

  function Basket() {}
  Basket.prototype = {
    constructor: Basket,
    getTotal() {
      return (
        storeData.offpageBasket.total +
        filter(onpageProducts, 'quantity').reduce(
          (memo, product) => memo + product.price * product.quantity,
          0
        )
      );
    },
    getDiscountSum() {
      return (storeData.discountPercentage * this.getTotal()) / 100;
    },
    getDiscountedTotal() {
      return this.getTotal() - this.getDiscountSum();
    },
    getProductTotal(pid) {
      if (!onpageProducts[pid]) {
        return false;
      }

      return onpageProducts[pid].price * onpageProducts[pid].quantity;
    },
    getQuantity() {
      return (
        storeData.offpageBasket.quantity +
        filter(onpageProducts, 'quantity').reduce((memo, product) => memo + product.quantity, 0)
      );
    },
    getProductQuantity(pid) {
      if (!onpageProducts[pid]) {
        return false;
      }

      return onpageProducts[pid].quantity;
    },
    increaseProduct(pid, quantity = 1) {
      return this.setProductQuantity(pid, this.getProductQuantity(pid) + Number(quantity));
    },
    decreaseProduct(pid, quantity = 1) {
      return this.setProductQuantity(pid, this.getProductQuantity(pid) - Number(quantity));
    },
    removeProduct(pid) {
      return this.setProductQuantity(pid, 0);
    },
    setProductQuantity(pid, quantity) {
      if (!onpageProducts[pid]) {
        return false;
      }

      const qnt = Number(quantity);

      const product = onpageProducts[pid];
      const prevQuantity = product.quantity;

      if (isSafeInteger(qnt) && qnt >= 0) {
        if (qnt === prevQuantity) {
          return false;
        }

        product.quantity = qnt;

        if (qnt === 0) {
          app.broadcast('basket/remove', { pid: product.id });
        } else if (prevQuantity === 0) {
          app.broadcast('basket/add', { pid: product.id });
          app.broadcast('basket/increase', { pid: product.id });
        } else if (qnt > prevQuantity) {
          app.broadcast('basket/increase', { pid: product.id });
        } else {
          app.broadcast('basket/decrease', { pid: product.id });
        }

        app.broadcast('basket/quantity-change', { pid: product.id });
        sync('basket/quantity-change', product);
      } else {
        throw new Error(
          'Product quantity should be a positive safe integer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger'
        );
      }

      return true;
    },
    getProductUnits(pid) {
      if (!onpageProducts[pid]) {
        return false;
      }

      return Math.round((onpageProducts[pid].quantity / onpageProducts[pid].unitVol) * 100) / 100;
    },
  };

  function Compare() {}
  Compare.prototype = {
    constructor: Compare,
    add(pid) {
      return this.setPresence(pid, true);
    },
    remove(pid) {
      return this.setPresence(pid, false);
    },
    setPresence(pid, isPresent) {
      const product = onpageProducts[pid];

      if (!product || isPresent === product.compared) {
        return false;
      }

      const topic = `compare/${isPresent ? 'add' : 'remove'}`;

      product.compared = isPresent;
      app.broadcast(topic, { pid: product.id });
      sync(topic, product);

      return true;
    },
    getPresence(pid) {
      return onpageProducts[pid].compared;
    },
    getQuantity() {
      return storeData.offpageCompare + filter(onpageProducts, 'compared').length;
    },
  };

  const proxyHandler = {
    get(target, propKey) {
      const targetValue = target[propKey]; // https://2ality.com/2017/11/proxy-method-calls.html#why-use-reflect.get()%3F

      if (typeof targetValue === 'function') {
        return function (...args) {
          if (!storeData) {
            app.broadcast('dataunavailable');
            return false;
          }
          return targetValue.apply(this, args);
        };
      }

      return targetValue;
    },
  };

  store.data = new Proxy(new Data(), proxyHandler);
  store.basket = new Proxy(new Basket(), proxyHandler);
  store.compare = new Proxy(new Compare(), proxyHandler);

  // get data for currently loaded page;
  // alternatively inline data in html to allow fastest readiness
  $.ajax({
    dataType: 'json',
    url: 'data.json',
    data: {
      // todo: page-specific ID for data request.
    },
  }).then(
    (response) => {
      storeData = response;
      onpageProducts = storeData.onpageProducts;
      app.broadcast('dataavailable');
      app.fire('dataavailable'); // allow services to listen
    },
    () => {
      // console.log('error');
    }
  );

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return store;
});
