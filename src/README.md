Данные для товаров - см. data.json. Атрибут `data-quantity` у кнопок покупки - показывает, сколько этой кнопкой можно купить товара. Атрибут нужен только в некоторых местах, по умолчанию его нет и покупается 1 товар.

=====

Некоторые элементы (модальные окна,блоки) содержат аякс-взаимодействия - все они используют утилитарную функцию `js/services/lib/util/request.js`. 

=====

Большинство табов подгружаются аяксом (соседние вкладки): https://jqueryui.com/tabs/#ajax