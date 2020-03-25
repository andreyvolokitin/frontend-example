import 'slick-carousel';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import App from '../app';
import Tabs from '../services/lib/tabs';

App.addModule('related', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  const namespace = '.module.related';
  let $moduleElem;
  let relatedTabs;
  const carouselKlass = 'js-related__carousel';

  function initRelatedCarousel($car) {
    $car.slick({
      arrows: false,
      dots: true,
      slidesToShow: 3,
      slidesToScroll: 3,
      infinite: false,
      respondTo: 'slider',
      activateRows: true,
      responsive: [
        {
          breakpoint: 750,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
            activateRows: true,
          },
        },
        {
          breakpoint: 540,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            slidesPerRow: 1,
            rows: 3,
            activateRows: false,
          },
        },
      ],
    });
  }

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    init() {
      $moduleElem = $(context.getElement());
      relatedTabs = Tabs.create($moduleElem);
      relatedTabs.init();
      initRelatedCarousel($moduleElem.find(`.${carouselKlass}`));

      $moduleElem.on(`tabsload${namespace}`, (e, ui) =>
        initRelatedCarousel(ui.panel.find(`.${carouselKlass}`))
      );
    },
    destroy() {
      $moduleElem.off(namespace);
      relatedTabs.destroy();
      $moduleElem = null;
    },
  };
});
