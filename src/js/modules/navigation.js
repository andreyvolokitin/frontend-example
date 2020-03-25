import enquire from 'enquire.js';
import { debounce } from 'throttle-debounce';
import 'jquery-menu-aim';
import 'jquery-ui/ui/position';

import App from '../app';
import { moveBlock, revertBlock } from '../services/lib/util/switch-dom-position';

App.addModule('navigation', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  const eventNamespace = '.module.navigation';

  const navBlockCachedKlass = 'nav-block_cached';
  const navBlockInitedKlass = 'nav-block_inited';
  const navBlockExpandedKlass = 'nav-block_expanded';
  const navBlockOverflowKlass = 'nav-block_overflown';
  const navBlockAlteredKlass = 'nav-block_altered';
  const navBlockVisibleKlass = 'nav-block_vis';

  const itemKlass = 'nav__item';
  const activeItemKlass = 'nav__item_hover';
  const moreItemKlass = 'nav__item_more';

  const navDropKlass = 'nav__drop';

  const navListKlass = 'nav__list';
  const navListDropKlass = 'nav__list_drop';

  const pageNavKlass = 'page__nav';
  const pageNavReadyKlass = 'page__nav_ready';
  const pageNavToggledKlass = 'page__nav_toggled';
  const tempVisKlass = 'temporary-visible-offscreen';

  const jsNavExpandKlass = 'js-navigation__expand';
  const jsNavTriggerKlass = 'js-navigation__trigger';
  const jsNavCloseKlass = 'js-navigation__close';

  let $navBlock;
  let $navBar;
  let $navBarInner;
  let $nav;
  let $navHolder;
  let $navList;
  let $navListDrop;
  let $navItems;
  let $moreItem;
  let $pageNav;
  let $jsNavExpand;
  let navBlockWidth;
  let navWidthCurrent;
  let itemsWidth;
  let moreItemWidth;
  let lastItemGap;
  let navBarShift;

  function getItemsWidth($items) {
    let width = 0;

    $.each($items, function () {
      const $item = $(this);
      const w = $item[0].getBoundingClientRect().width;
      const ml = parseInt($item.css('marginLeft'), 10);
      const mr = parseInt($item.css('marginRight'), 10);
      const finalW = w + mr + ml;

      if (!$item.data('width')) {
        // console.log($item, finalW);
        $item.data('width', finalW);
      }

      width += finalW;
    });

    return width;
  }
  function getItemsFitInWidth(width, $items, isShrinking) {
    let i = 0;
    let availableWidth = width;
    let comparingLimit;

    comparingLimit = isShrinking ? lastItemGap : 0;

    if (!comparingLimit) {
      comparingLimit = 0;
    }

    // eslint-disable-next-line consistent-return
    $.each($items, function () {
      const $item = $(this);
      const iw = isShrinking
        ? $item[0].getBoundingClientRect().width +
          parseInt($item.css('marginLeft'), 10) +
          parseInt($item.css('marginRight'), 10)
        : $item.data('width');

      availableWidth -= iw;

      // console.log(
      //   'item width: ' +
      //     iw +
      //     ' comparingLimit: ' +
      //     comparingLimit +
      //     ' total width: ' +
      //     availableWidth
      // );

      if (availableWidth >= comparingLimit) {
        i += 1;
      } else {
        return false;
      }
    });

    return $items.slice(0, i);
  }

  const mq = [
    'screen and (max-width: 660px)',
    {
      match() {
        moveBlock($nav, $navHolder);
      },
      unmatch() {
        revertBlock($nav);
      },
    },
  ];

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    onmessage: {
      fontsactive() {
        this.fit();
      },
    },
    isOpen() {
      return $pageNav.hasClass(pageNavToggledKlass);
    },
    open() {
      $pageNav.off('.nav-transitionend').addClass(pageNavReadyKlass);
      setTimeout(() => $pageNav.addClass(pageNavToggledKlass), 0);
    },
    close() {
      $pageNav
        .one(
          'transitionend.nav-transitionend webkitTransitionEnd.nav-transitionend oTransitionEnd.nav-transitionend MSTransitionEnd.nav-transitionend',
          function () {
            $(this).off('.nav-transitionend').removeClass(pageNavReadyKlass);
          }
        )
        .removeClass(pageNavToggledKlass);
    },
    toggleExpand(force) {
      $navBlock.toggleClass(navBlockExpandedKlass, force);
    },
    fit() {
      let availWidth;
      let startDropItems;

      $navItems = $navList.find(`.${itemKlass}:not(.${moreItemKlass})`);
      itemsWidth = getItemsWidth($navItems);

      $navBlock.addClass(navBlockCachedKlass);

      navBlockWidth = $navBlock.width();
      navWidthCurrent = $navList.width();
      moreItemWidth = $moreItem.addClass(tempVisKlass)[0].getBoundingClientRect().width;
      $moreItem.removeClass(tempVisKlass);

      const wasAltered = $navBlock.hasClass(navBlockAlteredKlass);

      if (itemsWidth > navBlockWidth - navBarShift) {
        $navBlock.addClass(navBlockOverflowKlass);
        context.broadcast('navfit', {
          overflown: true,
        });
        availWidth = navBlockWidth - (wasAltered ? moreItemWidth : 0);

        if (itemsWidth > availWidth) {
          $navBlock.addClass(navBlockAlteredKlass);
          availWidth -= !wasAltered ? moreItemWidth : 0;
          $navListDrop.prepend($navItems.not(getItemsFitInWidth(availWidth, $navItems, true)));
        }
      } else if (!$navListDrop.find(`.${itemKlass}`).length) {
        $navBlock.removeClass(navBlockOverflowKlass);
        context.broadcast('navfit', {
          overflown: false,
        });
      }

      if (
        itemsWidth <
        navWidthCurrent - ($navBlock.hasClass(navBlockAlteredKlass) ? moreItemWidth : 0)
      ) {
        startDropItems = $navListDrop.find(`.${itemKlass}`);
        $navList.append(
          getItemsFitInWidth(
            navWidthCurrent -
              ($navBlock.hasClass(navBlockAlteredKlass) && startDropItems.length > 1
                ? moreItemWidth
                : 0) -
              itemsWidth -
              (!$navItems.length ? lastItemGap : 0) +
              (startDropItems.length > 1 ? 0 : lastItemGap),
            startDropItems
          )
        );

        if (!$navListDrop.find(`.${itemKlass}`).length) {
          $navBlock.removeClass(navBlockAlteredKlass);
          if (
            getItemsWidth($navList.find(`.${itemKlass}:not(.${moreItemKlass})`)) <=
            navBlockWidth - navBarShift
          ) {
            $navBlock.removeClass(navBlockOverflowKlass);
            context.broadcast('navfit', {
              overflown: false,
            });
          }
        }
      }

      $navBlock.removeClass(navBlockVisibleKlass);
    },
    init() {
      const that = this;

      $navBlock = $(context.getElement());
      $navBar = $navBlock.find('.nav-block__nav');
      $navBarInner = $navBar.find('.nav-block__nav__i');
      $nav = $navBar.find('.nav');
      $navHolder = $('.nav-holder');
      $navList = $nav.find(`.${navListKlass}:not(.${navListDropKlass})`);
      $navListDrop = $nav.find(`.${navListDropKlass}`);
      $moreItem = $nav.find(`.${moreItemKlass}`);

      $jsNavExpand = $(`.${jsNavExpandKlass}`);

      lastItemGap = parseInt($navList.find(`.${itemKlass}:last-child`).css('marginRight'), 10);
      navBarShift = $navBarInner.outerWidth(true) - $navBarInner.width();
      $pageNav = $(`.${pageNavKlass}`);

      $navBlock.addClass(`${navBlockInitedKlass} ${navBlockVisibleKlass}`);

      $(document)
        .on(
          `click${eventNamespace}`,
          `.${jsNavTriggerKlass}`,
          this[this.isOpen() ? 'close' : 'open']
        )
        .on(`click${eventNamespace}`, `.${jsNavCloseKlass}`, this.close)
        .on(`click${eventNamespace}`, `.${jsNavExpandKlass}`, function () {
          const buttonData = $(this).data('comp.button');

          that.toggleExpand(buttonData.isToggled());
        })
        .on(`keydown${eventNamespace}`, (e) => {
          if (e.keyCode === 27) {
            this.toggleExpand(false);
            $jsNavExpand.button('toggle', false);

            this.close();
          }
        })
        .on(`mousedown${eventNamespace} click${eventNamespace}`, (e) => {
          const target = $(e.target);

          if (
            !target.closest(`.${jsNavExpandKlass}`).length &&
            !target.closest(`.${navListDropKlass}`).length
          ) {
            this.toggleExpand(false);
            $jsNavExpand.button('toggle', false);
          }
          if (
            !target.closest(`.${jsNavTriggerKlass}`).length &&
            !target.closest(`.${pageNavKlass}`).length
          ) {
            this.close();
          }
        })
        .on(`documentswipeleft${eventNamespace}`, () => {
          this.close();
        });

      $(window).on(
        `resize${eventNamespace} orientationchange${eventNamespace}`,
        debounce(250, this.fit)
      );

      $nav.find(`.${navListKlass}`).menuAim({
        activate(elem) {
          const $elem = $(elem);
          const $drop = $elem.find(`.${navDropKlass}`);
          const $container = $elem.closest(`.${navListKlass}`);
          const topShift = parseInt($drop.css('marginBottom'), 10);

          if (
            $container.hasClass(navListDropKlass) ||
            $container.closest(`.${pageNavKlass}`).length
          ) {
            return;
          }

          $drop.position({
            my: 'left top',
            at: `left bottom-${topShift}`,
            of: $elem,
          });
          $elem.addClass(activeItemKlass);
        },
        deactivate(elem) {
          const $elem = $(elem);
          const $container = $elem.closest(`.${navListKlass}`);

          if (
            $container.hasClass(navListDropKlass) ||
            $container.closest(`.${pageNavKlass}`).length
          ) {
            return;
          }
          $elem.removeClass(activeItemKlass);
        },
        exitMenu(nav) {
          $(nav).find(`.${activeItemKlass}`).removeClass(activeItemKlass);
          return true;
        },
        rowSelector: `.${itemKlass}`,
        submenuDirection: 'below',
      });

      this.fit();

      enquire.register(...mq);
    },
    destroy() {
      $navBlock = null;
      $navBar = null;
      $navBarInner = null;
      $nav = null;
      $navHolder = null;
      $navList = null;
      $navListDrop = null;
      $moreItem = null;
      $pageNav = null;

      $(document).off(eventNamespace);
      $(window).off(eventNamespace);

      enquire.unregister(...mq);
    },
  };
});
