/* eslint-disable */
import enquire from 'enquire.js';
import tmpl from 'resig';
import { debounce } from 'throttle-debounce';
import { filter, forEach } from 'lodash-es';
import { moveBlock, revertBlock } from '../services/lib/util/switch-dom-position';
import isElementInViewport from '../services/lib/util/is-in-viewport';
import initCustomScrollbars from '../services/lib/scrollbar';

import App from '../app';

App.addModule('branches', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  // const eventNamespace = '.module.branches';

  let $branches;
  let $body;
  let $doc;
  let $win;
  let isMobileBreakpoint = false;
  const isRetina = (function (w) {
    if (w.devicePixelRatio >= 1.5) return true;
    return (
      w.matchMedia &&
      w.matchMedia(
        '(-webkit-min-device-pixel-ratio:1.5),(min--moz-device-pixel-ratio:1.5),(-o-min-device-pixel-ratio:3/2),(min-resolution:1.5dppx)'
      ).matches
    );
  })(window);

  function adaptBranches($branchBlock) {
    $.each($branchBlock, function () {
      var $container = $(this),
        $mapModal = $('.branches-modal[data-id="' + $container.attr('data-id') + '"]');

      if (isMobileBreakpoint) {
        moveBlock($container.find('.branches__map'), $mapModal.find('.branches-map-holder'));
      } else {
        revertBlock($mapModal.find('.branches__map'));
      }
    });
  }

  function generateBranchesModals($branches) {
    var html = '';

    $.each($branches, function () {
      var $branchesBlock = $(this),
        id = $branchesBlock.attr('data-id');

      html += tmpl('branches_modal', { id: id });
    });

    $(html).appendTo($body);
  }
  const mq = [
    'screen and (max-width:660px)',
    {
      match() {
        isMobileBreakpoint = true;
        adaptBranches($('.branches'));
      },
      unmatch() {
        isMobileBreakpoint = false;
        adaptBranches($('.branches'));
        $('.branches-modal').modal('hide');
      },
    },
  ];

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    init() {
      $branches = $(context.getElement());
      $body = $('body');
      $doc = $(document);
      $win = $(window);

      /*generate branchs modals*/
      generateBranchesModals($branches);

      initCustomScrollbars($branches.find('.blist.scroll'));

      (function () {
        // var $branches = $onpageBranches;
        var interval = 100,
          markerDefaults = {},
          defaultZoom = 16,
          lineTypes = [
            [
              {
                icon: {
                  path: 'M 0,-1 0,1',
                  strokeOpacity: 1,
                  strokeWeight: 2,
                  scale: 3,
                },
                offset: '50%',
                repeat: '15px',
              },
            ],
            [
              {
                icon: {
                  path: 'M 0.5,-1 0.5,1 M -0.5,-1 -0.5,1',
                  strokeOpacity: 1,
                  strokeWeight: 1.5,
                  scale: 4,
                },
                offset: '0%',
                repeat: '6px',
              },
            ],
          ],
          activeKlass = 'is-active';

        function initBranchesMap(id) {
          if (!$('#' + id).length) {
            return;
          }

          var mapId = '#' + id,
            $mapElem = $(mapId),
            coords = $mapElem.attr('data-center').split(','),
            map = new GMaps({
              div: mapId,
              lat: parseFloat(coords[0]),
              lng: parseFloat(coords[1]),
              zoom: defaultZoom,
              scrollwheel: false,
              resize: function () {
                $mapElem.trigger('map-resized');
              },
              mapTypeControl: false,
              streetViewControl: true,
              draggable: true,
              overviewMapControl: true,
              overviewMapControlOptions: {
                opened: false,
              },
            });

          $win
            .on(
              'reset-contact-map resize orientationchange',
              debounce(40, function () {
                var $mapEl = $(map.el),
                  $win = $(this);
                if ($mapEl.hasClass('is-liquid-height')) {
                  $mapEl.css(
                    'height',
                    $win.height() -
                      $mapEl.offset().top -
                      $win.scrollTop() -
                      $('.footer').outerHeight()
                  );
                }
                map.refresh();
              })
            )
            .trigger('reset-contact-map');

          return map;
        }
        function getMapBlockById(id) {
          var $mapBlock = $('.branches[data-id="' + id + '"]').find('.branches__map');

          if (!$mapBlock.length) {
            $mapBlock = $('.branches-modal[data-id="' + id + '"]').find('.branches__map');
          }

          return $mapBlock;
        }
        function getContainerById(id) {
          return $('.branches[data-id="' + id + '"]');
        }
        function getCoordsByTrigger($trigger) {
          var currentBranchCoords = $trigger.attr('data-coords').split(',');

          forEach(currentBranchCoords, function (val, i, arr) {
            arr[i] = parseFloat(val);
          });
          return currentBranchCoords;
        }
        function switchCurrentMarker(map, markerObj) {
          map.cleanRoute();
          $(map.map.div).data('gmapCurrentRoute', false);
          map.removeMarkers();
          map.addMarkers([markerObj]);
          map.refresh();
          map.setZoom(defaultZoom);
        }
        function initBranchesBlock($container) {
          var $mapElem = getMapBlockById($container.attr('data-id')).find('.map__map'),
            $currentBranchTrigger = $container.find('.branches__trigger.' + activeKlass),
            map = initBranchesMap($mapElem.attr('id'));

          $mapElem.data('gmap', map);

          if ($container.hasClass('branches_contact')) {
            resetMapByTrigger($currentBranchTrigger, true);
          }

          if ($container.hasClass('branches_dealer')) {
            setDealersMarkersData($container);
            resetMapBySelect($container.find('.branches__select'));
          }
        }
        function resetMapByTrigger($trigger, isIniting) {
          var $container = $trigger.closest('.branches'),
            $mapBlock = getMapBlockById($container.attr('data-id')),
            $mapElem = $mapBlock.find('.map__map'),
            currentBranchCoords = getCoordsByTrigger($trigger);

          $mapElem.attr('data-center', currentBranchCoords.join(','));

          switchCurrentMarker(
            $mapElem.data('gmap'),
            $.extend(true, {}, markerDefaults, {
              lat: currentBranchCoords[0],
              lng: currentBranchCoords[1],
              title: $trigger.attr('data-marker-title'),
            })
          );

          if (!isMobileBreakpoint && !isIniting && !isElementInViewport($mapElem)) {
            $mapElem[0].scrollIntoView({
              behavior: 'smooth', // or "auto" or "instant"
              block: 'start', // or "end"
            });
            document.body.scrollTop -= 20;
          }

          $.each(
            $mapBlock.find('.map__route').find('.celem__input:checked'),
            (i, el) => (el.checked = false)
          );
        }

        function activateMarker($mapElem, branchID) {
          var markerInstances = $mapElem.data('currentMarkersInstances'),
            map = $mapElem.data('gmap'),
            activatedMarker;

          forEach(markerInstances, function (item) {
            if (item.branchID === branchID) {
              activatedMarker = item;
              return false;
            }
          });

          if (isMobileBreakpoint) {
            $doc.one('shown.bs.modal', '.branches-modal', function () {
              $mapElem.data('infobox').close();
              google.maps.event.addListenerOnce(
                map.map,
                'idle',
                debounce(140, function () {
                  activatedMarker.click();
                })
              );
            });
          } else {
            activatedMarker.click();

            if (!isElementInViewport($mapElem)) {
              $mapElem[0].scrollIntoView({
                behavior: 'smooth', // or "auto" or "instant"
                block: 'start', // or "end"
              });
              document.body.scrollTop -= 20;
            }
          }
        }
        function resetMapBySelect($branchesSelect) {
          var selectedAreaID = $branchesSelect.find('option:selected').attr('data-area'),
            isAllSelected = selectedAreaID === 'all',
            $container = $branchesSelect.closest('.branches'),
            containerID = $container.attr('data-id'),
            $mapBlock = getMapBlockById(containerID),
            $mapElem = $mapBlock.find('.map__map'),
            map = $mapElem.data('gmap'),
            dealersMarkers = $mapElem.data('dealersMarkers'),
            markers = isAllSelected
              ? dealersMarkers
              : filter(dealersMarkers, function (marker) {
                  return marker.areaID === selectedAreaID;
                }),
            latLngArr = [],
            onmapMarkers;

          forEach(markers, function (marker) {
            latLngArr.push(new google.maps.LatLng(marker.lat, marker.lng));
          });

          $mapElem.data('currentDealersMarkers', markers);

          map.removeMarkers();
          onmapMarkers = map.addMarkers(markers);
          map.fitLatLngBounds(latLngArr);
          $mapElem.data('currentMarkersInstances', onmapMarkers);
        }

        function setDealersMarkersData($container) {
          var $dealerItems = $container.find('.dealer-item:not(.item_fake)'),
            $mapElem = getMapBlockById($container.attr('data-id')).find('.map__map'),
            markers = [];

          $.each($dealerItems, function () {
            var $item = $(this),
              $trigger = $item.find('.branches__trigger'),
              markerCoords = getCoordsByTrigger($trigger),
              branchID = $item.attr('data-branch-id'),
              areaID = $item.attr('data-area');

            markers.push(
              $.extend(true, {}, markerDefaults, {
                areaID: areaID,
                branchID: branchID,
                lat: markerCoords[0],
                lng: markerCoords[1],
                title: $trigger.attr('data-marker-title'),
                click: function () {
                  var marker = this,
                    $mapElem = $(marker.map.div),
                    map = $mapElem.data('gmap'),
                    infobox = $mapElem.data('infobox');

                  if (!marker.content) {
                    marker.content = $container
                      .find('.dealer-item[data-branch-id="' + branchID + '"]')
                      .html();
                  }

                  infobox.close();
                  infobox.setContent(marker.content);
                  infobox.open(marker.map, marker);
                },
              })
            );
          });

          $mapElem.data({
            dealersMarkers: markers,
            infobox: new InfoBox({
              content: '',
              alignBottom: true,
              disableAutoPan: false,
              maxWidth: 0,
              pixelOffset: new google.maps.Size(-25, -8),
              zIndex: null,
              closeBoxMargin: '10px',
              closeBoxURL:
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpENjAxMTRBRTRFREExMUUzOTY1RTg0MjM2QzQ4QThGQiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpENjAxMTRBRjRFREExMUUzOTY1RTg0MjM2QzQ4QThGQiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkQ2MDExNEFDNEVEQTExRTM5NjVFODQyMzZDNDhBOEZCIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkQ2MDExNEFENEVEQTExRTM5NjVFODQyMzZDNDhBOEZCIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+E9VaUgAAABBJREFUeNpi+P//PwNAgAEACPwC/tuiTRYAAAAASUVORK5CYII=' /*t1.png in base64*/,
              infoBoxClearance: new google.maps.Size(0, 10),
              isHidden: false,
              pane: 'floatPane',
              enableEventPropagation: false,
            }),
          });
        }

        function getInfoboxBounds(infobox, map) {
          var bounds = map.getBounds();
          var projection = map.getProjection();

          var domElem = infobox.div_;
          var markerSpace = 0; /*32+8*/
          var maxTop = 0;
          var maxLeft = 0;
          var maxRight = 0;
          var topOfWindow = domElem.offsetHeight + markerSpace;
          var leftOfWindow = domElem.offsetWidth / 2;
          var rightOfWindow = domElem.offsetWidth / 2;

          if (topOfWindow > maxTop) maxTop = topOfWindow;
          if (leftOfWindow > maxLeft) maxLeft = leftOfWindow;
          if (rightOfWindow > maxRight) maxRight = rightOfWindow;

          var leftBounds = projection.fromLatLngToPoint(
            new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getSouthWest().lng())
          );
          var rightBounds = projection.fromLatLngToPoint(
            new google.maps.LatLng(bounds.getNorthEast())
          );
          var topBounds0 = rightBounds.y + maxTop;
          var rightBounds0 = rightBounds.x + maxRight;
          var leftBounds0 = leftBounds.x - maxLeft;
          bounds.extend(projection.fromPointToLatLng(leftBounds0, topBounds0));
          bounds.extend(projection.fromPointToLatLng(rightBounds0, topBounds0));

          return bounds;
        }

        setTimeout(function () {
          var gg = window['google'];
          if (gg !== undefined && gg['maps'] !== undefined) {
            markerDefaults = {
              icon: {
                url: isRetina ? 'assets/img/i46@2x.png' : 'assets/img/i46.png',
                // This marker is 20 pixels wide by 32 pixels high.
                size: new google.maps.Size(48, 61),
                // The origin for this image is (0, 0).
                origin: new google.maps.Point(0, 0),
                // The anchor for this image is the base of the flagpole at (0, 32).
                anchor: new google.maps.Point(24, 56),
              },
            };

            $.each($branches, function () {
              initBranchesBlock($(this));
            });

            return;
          }
          setTimeout(arguments.callee, interval);
        }, interval);

        $doc
          .on('click', '.branches__trigger', function () {
            var $thisTrigger = $(this),
              $container = $thisTrigger.closest('.branches'),
              $mapElem = getMapBlockById($container.attr('data-id')).find('.map__map'),
              $currentBranchTrigger = $thisTrigger
                .closest('.branches')
                .find('.branches__trigger.' + activeKlass);

            if (isMobileBreakpoint) {
              $doc
                .one('show.bs.modal', '.branches-modal', function () {
                  var infobox = $(this).find('.map__map').data('infobox');

                  if (infobox) {
                    infobox.close();
                  }
                })
                .one('shown.bs.modal', '.branches-modal', function () {
                  $(this).find('.map__map').data('gmap').refresh();
                });
            }

            if ($container.hasClass('branches_contact')) {
              if (!$thisTrigger.hasClass(activeKlass)) {
                $currentBranchTrigger.removeClass(activeKlass);
                resetMapByTrigger($thisTrigger.addClass(activeKlass));
              }
            }
            if ($container.hasClass('branches_dealer')) {
              activateMarker($mapElem, $thisTrigger.closest('.dealer-item').attr('data-branch-id'));
            }

            if (isMobileBreakpoint) {
              modals.launchModal(
                $('.branches-modal[data-id="' + $container.attr('data-id') + '"]')
              );
            }
          })
          .on('change', '.map__route', function (e) {
            if (!e.target.checked) {
              return;
            }

            var $celem = $(this),
              $mapBlock = $celem.closest('.branches__map'),
              id =
                $mapBlock.closest('.branches').attr('data-id') ||
                $mapBlock.closest('.branches-modal').attr('data-id'),
              $container = getContainerById(id),
              $currentBranchTrigger = $container.find('.branches__trigger.' + activeKlass),
              currentBranchCoords = getCoordsByTrigger($currentBranchTrigger),
              startCoords = $currentBranchTrigger.attr('data-start-point').split(','),
              isWalking = $celem.hasClass('map__route_walk'),
              $mapElem = $mapBlock.find('.map__map'),
              map = $mapElem.data('gmap');

            $celem.siblings('.map__route').find('.celem__input')[0].checked = false;
            map.cleanRoute();
            $mapElem.data('gmapCurrentRoute', false);

            forEach(startCoords, function (val, i, arr) {
              arr[i] = parseFloat(val);
            });

            map.drawRoute({
              origin: startCoords,
              destination: currentBranchCoords,
              travelMode: isWalking ? 'walking' : 'driving',
              strokeColor: '#054569',
              strokeOpacity: 0,
              icons: isWalking ? lineTypes[0] : lineTypes[1],
              callback: function (route) {
                if (!$celem.hasClass('checked')) {
                  map.cleanRoute();
                  $mapElem.data('gmapCurrentRoute', false);
                } else {
                  $mapElem.data('gmapCurrentRoute', route.overview_path);
                  map.fitLatLngBounds(route.overview_path);
                }
              },
            });
          })
          .on('change', '.map__route', function (e) {
            if (e.target.checked) {
              return;
            }

            var $celem = $(this),
              $mapBlock = $celem.closest('.branches__map'),
              id =
                $mapBlock.closest('.branches').attr('data-id') ||
                $mapBlock.closest('.branches-modal').attr('data-id'),
              $mapElem = $mapBlock.find('.map__map'),
              map = $mapElem.data('gmap');

            map.cleanRoute();
            $mapElem.data('gmapCurrentRoute', false);

            if (!$mapBlock.find('.map__route.checked').length) {
              map.refresh();
              map.setZoom(defaultZoom);
            }
          })

          /*handle branches tabs*/
          .on('tabsload', '.branches-tabs', function (e, ui) {
            var $loadedBranches = ui.panel.find('.branches');

            initContentsOf(ui.panel);
            $.each($loadedBranches, function () {
              initBranchesBlock($(this));
            });
            generateBranchesModals($loadedBranches);
            if (isMobileBreakpoint) {
              adaptBranches($loadedBranches);
            }
          })
          .on('tabsactivate', '.branches-tabs', function (e, ui) {
            var map = ui.newPanel.find('.map__map').data('gmap');

            if (map) {
              map.refresh();
            }
          })
          /*contact branches*/
          .on(
            'map-resized',
            '.branches__map_contact:visible',
            debounce(90, function () {
              $.each($(this), function () {
                var $mapBlock = $(this),
                  $mapElem = $mapBlock.find('.map__map'),
                  route = $mapElem.data('gmapCurrentRoute'),
                  currentCenter,
                  map = $mapElem.data('gmap');

                if (route) {
                  map.fitLatLngBounds(route);
                } else {
                  currentCenter = $mapElem.attr('data-center').split(',');
                  map.setCenter({
                    lat: parseFloat(currentCenter[0]),
                    lng: parseFloat(currentCenter[1]),
                  });
                }
              });
            })
          )
          /*dealer branches*/
          .on(
            'map-resized',
            '.branches__map_dealer:visible',
            debounce(90, function () {
              $.each($(this), function () {
                var $mapBlock = $(this),
                  $mapElem = $mapBlock.find('.map__map'),
                  infobox = $mapElem.data('infobox'),
                  latLngArr = [],
                  map = $mapElem.data('gmap');

                forEach($mapElem.data('currentDealersMarkers'), function (marker) {
                  latLngArr.push(new google.maps.LatLng(marker.lat, marker.lng));
                });

                if ((infobox && !infobox.div_) || !infobox) {
                  map.fitLatLngBounds(latLngArr);
                }
                if (infobox && infobox.div_) {
                  //getInfoboxBounds(infobox, map.map)
                }
              });
            })
          )
          .on('change', '.branches__select', function () {
            var $select = $(this),
              $container = $select.closest('.branches'),
              areaID = $select.find('option:selected').attr('data-area'),
              $dealerItems = $container.find('.dealer-item:not(.item_fake)'),
              $selectedAreaDealers = $dealerItems.filter('[data-area=' + areaID + ']');

            if (areaID === 'all') {
              $dealerItems.show();
            } else {
              $dealerItems.not($selectedAreaDealers).hide();
              $selectedAreaDealers.show();
            }

            resetMapBySelect($container.find('.branches__select'));
          });
      })();

      enquire.register(...mq);
    },
    destroy() {
      $branches = null;

      enquire.unregister(...mq);
    },
  };
});
