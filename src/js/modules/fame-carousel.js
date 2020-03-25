/* eslint-disable */

import 'slick-carousel';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { debounce } from 'throttle-debounce';

/* fame carousel */
(function () {
  var $fame = $('.fame'),
    breakpoint = 700,
    narrowKlass = 'is-narrow';

  var $win = $(window);

  function reappendDots($dots, $container) {
    $dots.prependTo($container);
  }

  $fame
    .on('click', '.zgal__link', function (e) {
      var $item = $(this).closest('.fame__item');

      if (!$fame.hasClass(narrowKlass) && !$item.hasClass('slick-center')) {
        e.preventDefault();
        e.stopPropagation();
        $fame.slick('slickGoTo', $item.data('slick-index'));
      }
    })
    .on('click', '.fame__item', function (e) {
      var $item = $(this);

      if (!$fame.hasClass(narrowKlass) && !$item.hasClass('slick-center')) {
        $fame.slick('slickGoTo', $item.data('slick-index'));
      }
    });

  $win.on(
    'fame-setup resize orientationchange',
    debounce(100, function (e) {
      $.each($fame, function () {
        var $container = $(this),
          isNarrow = $container.width() < breakpoint;

        if (isNarrow) {
          $container.addClass(narrowKlass);
          if (e.type === 'fame-setup') {
            $container.slick('slickGoTo', 0);
          }
        } else {
          $container.removeClass(narrowKlass);
        }

        reappendDots($container.find('.slick-dots'), $container);

        setTimeout(function () {
          $container.slick('setPosition');
        }, 200);
      });
    })
  );

  $fame
    .on('init', function (e, api) {
      setTimeout(function () {
        reappendDots(api.$dots, api.$slider);
      }, 0);
    })
    .slick({
      variableWidth: true,
      initialSlide: 1,
      slidesToShow: 3,
      infinite: false,
      arrows: false,
      dots: true,
      lazyLoad: 'progressive',
      adaptiveHeight: true,
      swipeToSlide: true,
      centerMode: true,
      respondTo: 'slider',
      responsive: [
        {
          breakpoint: breakpoint,
          settings: {
            slidesToShow: 1,
            centerMode: false,
            variableWidth: false,
          },
        },
      ],
    });

  $win.trigger('fame-setup');
})();
