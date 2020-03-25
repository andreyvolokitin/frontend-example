import 'jquery-ui/ui/widgets/tabs';
import 'jquery-ui/themes/base/core.css';
import 'jquery-ui/themes/base/tabs.css';

const instances = [];

function Tabs(element, options) {
  this.element = element;
  this.options = options;
  this.defaults = {
    active: 0,
    collapsible: false,
  };

  const activeIndexAttr = $(this.element).attr('data-active-index');

  if (activeIndexAttr) {
    this.defaults.active = activeIndexAttr;
  }
  if (activeIndexAttr === 'false') {
    this.defaults.active = false;
    this.defaults.collapsible = true;
  }
}
Tabs.prototype.init = function init() {
  const $element = $(this.element);

  $element.tabs($.extend(true, {}, this.defaults, this.options));
};
Tabs.prototype.destroy = function destroy() {
  $(this.element).tabs('destroy');
};

$(document)
  .on('tabsbeforeload', '.tabs', (e, ui) => {
    return (ui.panel || ui.newPanel).html() === '';
  })
  .on('tabsactivate', '.tabs', (e, ui) => {
    if (ui.oldPanel.length) {
      $.each(ui.oldPanel.find('form.js-autoreset'), (i, form) => form.reset());
    }
  });

export default {
  create($elements, options) {
    const currentInstances = [];

    $.each($elements, (i, element) => {
      currentInstances.push(new Tabs(element, options));
    });
    Array.prototype.push.apply(instances, currentInstances);

    return currentInstances.length === 1 ? currentInstances[0] : currentInstances;
  },
};
