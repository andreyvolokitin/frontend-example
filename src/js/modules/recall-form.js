import App from '../app';
import request from '../services/lib/util/request';

App.addModule('recall-form', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  const eventNamespace = '.module.recall-form';
  const redirectTimeout = 3000;
  const redirectURL = '//google.com';
  let $form;

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    scheduleRedirect() {
      setTimeout(() => {
        window.location = redirectURL;
      }, redirectTimeout);
    },
    submit() {
      request(() => $.ajax({ url: 'aa' }), {
        target: $form[0],
        allowSubsequent: false,
      });
    },
    init() {
      const that = this;

      $form = $(context.getElement());

      $form
        .on(`request-success${eventNamespace}`, () => {
          that.scheduleRedirect();
        })
        .on(`submit${eventNamespace}`, function (e) {
          e.preventDefault();
          that.submit();
        });
    },
    destroy() {
      $form.off(eventNamespace);
      $form = null;
    },
  };
});
