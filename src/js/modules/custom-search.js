import App from '../app';
import '../behaviors/search';
import { validToSubmit } from '../services/lib/util/form-validity';

App.addModule('custom-search', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  const eventNamespace = '.module.custom-search';
  let $form;

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    behaviors: ['search'],
    submit(e) {
      e.preventDefault();

      if (validToSubmit($form[0])) {
        // custom logic
      }
    },
    init() {
      $form = $(context.getElement());
      $form.on(`submit${eventNamespace}`, this.submit);
    },
    destroy() {
      $form.off(`${eventNamespace}`);
      $form = null;
    },
  };
});
