import App from '../app';

App.addBehavior('ajax-form', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  const eventNamespace = '.behavior.ajax-form';
  const sentKlass = 'is-sent';
  let $form;
  let $doc;

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    reset() {
      $form.removeClass(sentKlass).trigger('content-update');
    },
    markAsSent() {
      $form.addClass(sentKlass).trigger('content-update');
    },
    init() {
      const that = this;
      $form = $(context.getElement());
      $doc = $(document);

      $form
        .on(`request-success${eventNamespace}`, function () {
          that.markAsSent();
        })
        .on(`submit${eventNamespace}`, (e) => {
          e.preventDefault();
        });

      $doc.on(`hidden.bs.modal${eventNamespace}`, (e) => {
        if (e.target.contains($form[0])) {
          that.reset();
        }
      });
    },
    destroy() {
      $form.off(eventNamespace);
      $doc.off(eventNamespace);
      $form = null;
    },
  };
});
