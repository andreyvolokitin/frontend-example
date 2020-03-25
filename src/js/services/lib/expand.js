import 'bootstrap/js/dist/collapse';
import getTimestamp from './util/get-timestamp';

// https://getbootstrap.com/docs/4.4/components/collapse/
function initExpand(elems) {
  elems.forEach((elem) => {
    const id = `collapse-${getTimestamp()}`;

    // eslint-disable-next-line no-param-reassign
    elem.querySelector('.exp__content').id = id;
    elem.querySelector('.exp__handler').setAttribute('data-target', `#${id}`);
  });
}

export default initExpand;
