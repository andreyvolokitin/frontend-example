import { debounce } from 'throttle-debounce';

import App from '../app';
import '../behaviors/product';
import initCustomScrollbars from '../services/lib/scrollbar';
import Tabs from '../services/lib/tabs';
import commonUi from '../services/lib/util/common-ui';
import '../services/lib/numspin';
import '../services/store.t3';

App.addModule('compare', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  const namespace = '.module.compare';
  let moduleElem;
  let compareTabs;
  const scrollerSelector = '.comp__list-scroller';

  const store = context.getService('store');

  function bindScrollerScroll($elem) {
    $elem.on(
      `scroll${namespace}`,
      debounce(100, true, () => context.broadcast('comparelist-scrolled'))
    );
  }

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    behaviors: ['product'],
    initLoadedWithin($container) {
      commonUi($container[0]);
      initCustomScrollbars($container.find('.scroll'));
      $container.find('.numspin').numspin();
      bindScrollerScroll($container.find(scrollerSelector));
    },
    toggleParameter(paramID, isToggled) {
      const activePanel = $(moduleElem).tabs('instance').panels[
        $(moduleElem).tabs('option', 'active')
      ];
      const inactiveKlass = 'is-inactive';

      $(activePanel)
        .find(`.js-compare__param[data-param="${paramID}"]`)
        .toggleClass(inactiveKlass, isToggled)
        .trigger('content-update');
    },
    deleteItem(deleteHandler) {
      const emptyKlass = 'is-empty';
      const itemCellKlass = 'js-compare__item-cell';

      const cell = deleteHandler.closest(`.${itemCellKlass}`);
      const table = cell.closest('table');
      const index = $(cell).index();
      const container = table.closest('.js-compare__list');
      const { pid } = deleteHandler.dataset;

      store.compare.setPresence(pid, false);
      $(table.querySelectorAll(`.${itemCellKlass}:nth-child(${index + 1})`)).remove();
      $(table).trigger('content-update');

      if (!table.querySelectorAll(`.${itemCellKlass}`).length) {
        container.classList.add(emptyKlass);
      }
    },
    init() {
      moduleElem = context.getElement();

      initCustomScrollbars($(moduleElem.querySelectorAll('.scroll')));

      compareTabs = Tabs.create($(moduleElem));
      compareTabs.init();

      $(moduleElem)
        .on(`tabsbeforeactivate${namespace}`, (e, ui) =>
          ui.newPanel.css('min-height', `${ui.oldPanel.height()}px`)
        )
        .on(`tabsload${namespace}`, (e, ui) => {
          this.initLoadedWithin(ui.panel);
          ui.panel.css('min-height', '');
        })
        .on(`change${namespace}`, '.js-compare__param-toggle', (e) =>
          this.toggleParameter(e.target.dataset.param, !e.target.checked)
        )
        .on(`click${namespace}`, '.js-compare__delete', (e) => this.deleteItem(e.target));

      bindScrollerScroll($(moduleElem).find(scrollerSelector));
    },
    destroy() {
      compareTabs.destroy();
      $(moduleElem).off(namespace).find(scrollerSelector).off(namespace);

      moduleElem = null;
    },
  };
});
