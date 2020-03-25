import App from '../app';
import modalApi from '../services/lib/modal';

App.addBehavior('modal', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  const eventNamespace = '.behavior.modal';
  let $modal;
  let modalId;
  let $triggers;
  let $body;

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    show($trigger) {
      if ($trigger && $trigger.is('[data-dismiss="modal"]') && $body.hasClass('modal-open')) {
        $body.one('hidden.bs.modal', '.modal', () => {
          modalApi.show($modal);
        });
      } else {
        modalApi.show($modal);
      }
    },
    init() {
      const that = this;

      $body = $('body');
      $modal = $(context.getElement());
      modalId = $modal.attr('data-modal');
      $triggers = $(`[data-modal-trigger="${modalId}"]`);

      $triggers.on(`click${eventNamespace}`, function handler(e) {
        e.preventDefault();
        that.show($(this));
      });
      /* Reset selected forms inside modal */
      $(document).on(`hidden.bs.modal${eventNamespace}`, '.modal', function handler() {
        this.querySelectorAll('form.js-autoreset').forEach((form) => form.reset());
      });
    },
    destroy() {
      $(document).off(eventNamespace);
      $triggers.off(eventNamespace);
      $body = null;
      $modal = null;
      $triggers = null;
    },
  };
});
