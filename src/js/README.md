For the general explanation of the files and folders structure see the docs: http://t3js.org/docs/.
 
 - `services/lib` contains basic components utilities library (todo: abstract to the separate package).
 - `pages` contains JS entry points for webpack.
 
Things to keep in mind
===

1. Regular ES-modules should be preferred as "services" (without using T3 `.addService()`). True T3 services should be marked within a filename: `name.t3.js`.
2. A service and a module can have the same name, i.e. "my-widget". This is done in order to represent widgets as separate modules. For a more componetized approach widgets are made as separate modules, so a widget module is generally just an initializing wrapper for a widget service. 
 
    Alternatively there could be a bigger module (this is what `t3js` docs advocating) which can contain all application logic inside of it and refer to (and initialize) multiple widget services. Then there would be no such thing as widget module (and duplicated module/service names), widgets would be used by bigger wrapper modules, but in this case we loose some of the benefits of more granular componetization. 
    
    I.e. in order to reuse some widget in different big module we should've duplicate its initialization code inside that module, or create a behavior which then we should add/remove to/from random big modules just to be able to put/remove a widget inside of it. This is all instead of just putting or removing widget module on a page.

3. Modules in HTML are marked with `data-module` attribute: `data-module="module-name"`. Elements needed to perform application logic inside (or outside of) the module boundaries can be marked with a "js-hook" class using BEM notation: `js-module-name__hook-name` (same notation is used for hooks outside of the module/block). On the other hand, if these elements are just dumb widgets with no application logic, they can be reached by their regular css-class (i.e. for widget initialization). Optionally this class could be embedded inside a service representing this widget to not duplicate these classes, so that inside a module we could write:
```js
const $moduleElement = $(context.getElement());
const DumbWidgetService = context.getService('my-dumb-widget');

const $widgetElement = $moduleElement.find(`.${DumbWidgetService.widgetClass}`); // get a className from `WidgetService.widgetClass`
const dumbWidget = DumbWidgetService.create();

widget.init();
```
    
