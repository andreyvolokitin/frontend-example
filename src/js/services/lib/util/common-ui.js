import '../button';
import '../select';
import '../input';
import '../numeric';
import { textareaAutogrow } from './mobile-boilerplate';

function commonUi(container = document) {
  $(container.querySelectorAll('.button')).button();
  $(container.querySelectorAll('.select')).select();
  $(container.querySelectorAll('.input')).input();
  $(container.querySelectorAll('.numeric')).numeric();
  textareaAutogrow(container.querySelectorAll('textarea'));
}

export default commonUi;
