import 'jquery-ui/ui/widgets/slider';
import 'jquery-ui/themes/base/core.css';
import 'jquery-ui/themes/base/slider.css';
import 'jquery-ui-extensions/ui/jquery.ui.labeledslider';
import 'jquery-ui-extensions/themes/base/jquery.ui.labeledslider.css';
import 'jquery-ui-touch-punch-amd/jquery.ui.touch-punch.min';

function initRange($elements) {
  $elements.each(function () {
    const $container = $(this);
    const $slider = $container.find('.range__slider');
    const $inputs = $container.find('.range__input');
    const $minInput = $inputs.filter('.range__input-min');
    const $maxInput = $inputs.filter('.range__input-max');
    const tooltipKlass = 'range__tooltip';
    const min = parseInt($minInput.attr('data-min'), 10);
    const max = parseInt($maxInput.attr('data-max'), 10);
    const values = [parseInt($minInput.val(), 10), parseInt($maxInput.val(), 10)];

    function refreshTooltip(tooltip, val) {
      tooltip.find(`.${tooltipKlass}`).html(val);
    }

    $slider
      .on('labeledsliderslide', function (event, ui) {
        $minInput.val(ui.values[0]).trigger('num-entered');
        $maxInput.val(ui.values[1]).trigger('num-entered');
        refreshTooltip($(ui.handle), ui.value);
      })
      .on('labeledsliderreset', function (e) {
        const $target = $(e.target);

        $target.find('.ui-slider-handle').eq(0).find(`.${tooltipKlass}`).html($minInput.val());
        $target.find('.ui-slider-handle').eq(1).find(`.${tooltipKlass}`).html($maxInput.val());
      })
      .labeledslider({
        range: true,
        min,
        max,
        values,
        tickInterval: max - min,
        create(e) {
          const $target = $(e.target);
          const tooltip1 = `<div class="${tooltipKlass}">${values[0]}</div>`;
          const tooltip2 = `<div class="${tooltipKlass}">${values[1]}</div>`;

          $target.find('.ui-slider-handle').eq(0).html(tooltip1);
          $target.find('.ui-slider-handle').eq(1).html(tooltip2);
        },
      });

    $inputs.on('num-entered', function () {
      const $input = $(this);
      const $inputMin = $inputs.filter('.range__input-min');
      const $inputMax = $inputs.filter('.range__input-max');
      const isMinInput = $input.is($inputMin);
      const isMaxInput = $input.is($inputMax);
      const enteredVal = parseInt($input.val(), 10);
      const minLimit = parseInt($input.data('min'), 10) || 0;
      const maxLimit = parseInt($input.data('max'), 10) || Number.POSITIVE_INFINITY;
      const minVal = parseInt($inputMin.val(), 10);
      const maxVal = parseInt($inputMax.val(), 10);
      const isLtMinLimit = enteredVal < minLimit;
      const isGtMaxLimit = enteredVal > maxLimit;
      const isLtMinVal = isMaxInput ? enteredVal < minVal : false;
      const isGtMaxVal = isMinInput ? enteredVal > maxVal : false;
      let processedVal;

      if (isMinInput) {
        if (isLtMinLimit) {
          processedVal = minLimit;
        } else {
          processedVal = isGtMaxVal ? maxVal : enteredVal;
        }

        $slider.labeledslider('values', [processedVal, maxVal]);
      }
      if (isMaxInput) {
        if (isLtMinLimit || isLtMinVal) {
          processedVal = minVal;
        } else {
          processedVal = isGtMaxLimit ? maxLimit : enteredVal;
        }

        $slider.labeledslider('values', [minVal, processedVal]);
      }
    });
  });
}

$(document).on('reset', 'form', (e) => {
  const $ranges = $(e.target).find('.range');
  $ranges.each((i, elem) => {
    const $range = $(elem);
    const $slider = $range.find('.range__slider');
    const $rangeInputs = $range.find('.range__input');
    const $inputMin = $rangeInputs.filter('.range__input-min');
    const $inputMax = $rangeInputs.filter('.range__input-max');
    const inputMinVal =
      $inputMin.attr('type') === 'hidden'
        ? parseInt($inputMin.attr('data-val'), 10)
        : parseInt($inputMin.val(), 10);
    const inputMaxVal =
      $inputMax.attr('type') === 'hidden'
        ? parseInt($inputMax.attr('data-val'), 10)
        : parseInt($inputMax.val(), 10);
    const minLimit = parseInt($inputMin.attr('data-min'), 10);
    const maxLimit = parseInt($inputMax.attr('data-max'), 10);
    const values = [Math.max(inputMinVal, minLimit), Math.min(inputMaxVal, maxLimit)];

    $inputMin.val(values[0]);
    $inputMax.val(values[1]);

    $slider.labeledslider('values', values).trigger('labeledsliderreset');
  });
});

export default initRange;
