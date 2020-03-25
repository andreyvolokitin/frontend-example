import enquire from 'enquire.js';
import 'fotorama/fotorama';
import 'fotorama/fotorama.css';
import 'slick-carousel';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import App from '../app';
import Tabs from '../services/lib/tabs';
import '../behaviors/product';

App.addModule('product-card', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  let $moduleElem;
  let $prodGal;
  let $prodThumbs;
  let $specTabs;
  let specTabs;

  const prodGalOpts = {
    minheight: 320,
    width: '100%',
    fit: 'scaledown',
    allowfullscreen: true,
    ratio: 400 / 320,
    nav: false,
  };
  const galleryStartSlide = 0;
  const galleryTransitionDuration = 300;
  const activeThumbKlass = 'is-active';

  function resetProdGalOptions(opts) {
    $.each($prodGal, (i, el) => {
      const api = $(el).data('fotorama');

      if (api) {
        api.setOptions(opts);
      } else {
        // eslint-disable-next-line no-return-assign
        Object.keys(opts).forEach((option) => (prodGalOpts[option] = opts[option]));
      }
    });
  }

  const mq = [
    [
      'screen and (max-width: 1015px)',
      {
        match() {
          resetProdGalOptions({
            nav: 'dots',
          });
        },
        unmatch() {
          resetProdGalOptions({
            nav: false,
          });

          $.each($prodThumbs, function () {
            const $thumbs = $(this);
            const $slides = $thumbs.find('.slick-slide');
            const $visible = $slides.filter('.slick-active');
            const visibleLength = $visible.length;
            const activeIndex = parseInt($slides.filter('.is-active').attr('data-slick-index'), 10);

            $thumbs.slick(
              'slickGoTo',
              Math.max(
                0,
                Math.min(
                  $slides.length - visibleLength,
                  activeIndex - Math.floor(visibleLength / 2)
                )
              )
            );
          });
        },
      },
    ],
    [
      'screen and (max-width: 660px)',
      {
        match() {
          resetProdGalOptions({
            minheight: 240,
            maxheight: 320,
          });
        },
        unmatch() {
          resetProdGalOptions({
            minheight: 320,
            maxheight: null,
          });
        },
      },
    ],
  ];

  function setActiveThumb($thumbsElem, index) {
    $thumbsElem
      .find('.prod-thumbs__item')
      .removeClass(activeThumbKlass)
      .eq(index)
      .addClass(activeThumbKlass)
      .find('.prod-thumbs__dec')
      .css('transform', '');
  }

  function handleThumbsEdgeScroll(targetIndex, $visible, $thumbs) {
    if (targetIndex === 0) {
      $thumbs.slick('slickPrev');
    } else if (
      targetIndex === $visible.length - 1 &&
      !$visible.last().is($thumbs.find('.slick-slide:last-child'))
    ) {
      $thumbs.slick('slickNext');
    }
  }

  function altifyGalleryImage(slide, attrs) {
    const $frame = slide.$stageFrame;

    if (!$frame) {
      return;
    }

    $frame.find('.fotorama__img').attr({
      alt: attrs.alt,
      title: attrs.title,
    });
  }

  function initProductGallery($frameElem, $thumbsElem) {
    let scrollingByThumbClick = false;

    $thumbsElem.slick({
      slidesToShow: 3,
      infinite: false,
      vertical: true,
      verticalSwiping: !Modernizr.touchevents,
      swipeToSlide: true,
      initialSlide: galleryStartSlide,
      waitForAnimate: false,
      speed: galleryTransitionDuration,
      arrows: false,
    });

    prodGalOpts.startindex = galleryStartSlide;
    prodGalOpts.transitionduration = galleryTransitionDuration;

    $frameElem
      .on('fotorama:load', function (e, fotorama, extra) {
        const slide = extra.frame;

        altifyGalleryImage(slide, {
          alt: slide.alt,
          title: slide.title,
        });
      })
      .on('fotorama:show', function (e, fotorama) {
        let $thumbItems;
        let $visibleThumbs;
        let targetPos;

        if (scrollingByThumbClick) {
          scrollingByThumbClick = false;
        } else {
          $thumbItems = $thumbsElem.slick('getSlick').$slides;
          $visibleThumbs = $thumbItems.filter('.slick-active');
          targetPos = $visibleThumbs.index($thumbItems.eq(fotorama.activeIndex));

          setActiveThumb($thumbsElem, fotorama.activeIndex);
          handleThumbsEdgeScroll(targetPos, $visibleThumbs, $thumbsElem);
        }
      })
      .fotorama(prodGalOpts);

    setActiveThumb($thumbsElem, galleryStartSlide);

    $thumbsElem
      .on('click', '.prod-thumbs__item', function () {
        const $thumb = $(this).closest('.slick-slide');
        const index = $thumb.attr('data-slick-index');
        const $visible = $thumbsElem.slick('getSlick').$slides.filter('.slick-active');
        const targetPos = $visible.index($thumb);

        scrollingByThumbClick = true;
        setActiveThumb($thumbsElem, index);
        $frameElem.data('fotorama').show(index);
        handleThumbsEdgeScroll(targetPos, $visible, $thumbsElem);
      })
      .on('mouseenter mouseleave', '.prod-thumbs__item', function (e) {
        const $thumb = $(this);
        const $currentThumb = $thumb.is(`.${activeThumbKlass}`)
          ? $thumb
          : $thumb.closest('.slick-track').find(`.${activeThumbKlass}`);

        $currentThumb
          .find('.prod-thumbs__dec')
          .css(
            'transform',
            e.type === 'mouseenter'
              ? `translate(0,${$thumb.position().top - $currentThumb.position().top}px)`
              : ''
          );
      });
  }

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    behaviors: ['product'],

    init() {
      $moduleElem = $(context.getElement());
      $prodGal = $moduleElem.find('.js-product-card__gallery');
      $prodThumbs = $moduleElem.find('.js-product-card__thumbs');
      $specTabs = $moduleElem.find('.js-product-card__specs');

      initProductGallery($prodGal, $prodThumbs);

      specTabs = Tabs.create($specTabs);
      specTabs.init();

      mq.forEach((query) => enquire.register(...query));
    },
    destroy() {
      specTabs.destroy();
      $moduleElem = null;
      $prodGal = null;
      $prodThumbs = null;
      $specTabs = null;

      mq.forEach((query) => enquire.unregister(...query));
    },
  };
});
