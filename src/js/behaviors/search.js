import App from '../app';
import Searchbox from '../services/searchbox';
import { validToSubmit } from '../services/lib/util/form-validity';

App.addBehavior('search', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  const eventNamespace = '.behavior.search';
  let $form;

  let searchbox;

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    submit() {
      if (!validToSubmit($form[0])) {
        return;
      }

      console.log('submit search for: ', $form.attr('data-search'));
    },
    init() {
      $form = $(context.getElement());
      $form.on(`submit${eventNamespace}`, this.submit);

      searchbox = Searchbox.create($form.find(`.${Searchbox.boxKlass}`));
      searchbox.init();
    },
    destroy() {
      $form.off(`${eventNamespace}`);
      $form = null;
      searchbox.destroy();
    },
  };
});
