import enquire from 'enquire.js';

import App from '../app';
import Tabs from '../services/lib/tabs';
import '../services/lib/sorter';
import '../behaviors/product';

App.addModule('catalog', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  const namespace = '.module.catalog-tabs';
  const listKlass = 'catalog-tabs_list';
  let tabs;
  let $catalogContainer;
  let $catalogTabs;
  let $catalogTabsPicTabIndex;

  const mq = [
    'screen and (max-width: 660px)',
    {
      match() {
        if ($catalogTabs.hasClass(listKlass)) {
          $catalogTabs.tabs('option', 'active', $catalogTabsPicTabIndex);
        }
      },
    },
  ];

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    behaviors: ['product'],
    sort(sorterElem) {
      const { dataset } = sorterElem;

      alert(`Sorting ${dataset.name} inside ${dataset.group} in "${dataset.order}" order`);
    },
    init() {
      const that = this;

      $catalogContainer = $(context.getElement());
      $catalogTabs = $catalogContainer.find('.js-catalog__tabs');
      tabs = Tabs.create($catalogTabs);
      $catalogTabsPicTabIndex = $catalogTabs.find('.catalog-tabs__tab-pic').index();

      $catalogTabs
        .on('tabsactivate', (e, ui) => {
          that.handleListKlass(ui.newTab);
        })
        .on('tabscreate', (e, ui) => {
          that.handleListKlass(ui.tab);
          $catalogTabs.tabs('disable', 0);
        });

      tabs.init();

      $catalogContainer
        .on(`sort.comp.sorter${namespace}`, (e) => this.sort(e.target))
        .find('.js-catalog__sort')
        .sorter();

      enquire.register(...mq);
    },
    handleListKlass($selectedTab) {
      $catalogTabs.toggleClass(listKlass, $selectedTab.hasClass('catalog-tabs__tab-list'));
    },
    destroy() {
      $catalogContainer.off(namespace);
      tabs.destroy();
      $catalogContainer = null;
      $catalogTabs = null;

      enquire.unregister(...mq);
    },
  };
});
