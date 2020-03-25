import App from '../app';
// import '../services/lib/ajax-form';
import request from '../services/lib/util/request';

App.addModule('subscribe', (context) => {
  //-----------------------------------------------------------
  // Private
  //-----------------------------------------------------------

  const eventNamespace = '.module.subscribe';
  const toggledKlass = 'subscribe_toggled';

  let $form;
  let $trigger;
  let $field;

  //-----------------------------------------------------------
  // Public
  //-----------------------------------------------------------

  return {
    submit() {
      request(
        () =>
          $.ajax({
            url: 'https://httpbin.org/get',
          }),
        {
          target: $form[0],
          allowSubsequent: false,
        }
      );
    },
    isOpen() {
      return $form.hasClass(toggledKlass);
    },
    open() {
      $form.addClass(toggledKlass);
      $field.focus();
    },
    close() {
      $form.removeClass(toggledKlass);
    },
    toggle() {
      if (this.isOpen()) {
        this.close();
      } else {
        this.open();
      }
    },
    init() {
      const that = this;

      $form = $(context.getElement());
      $trigger = $form.find('.js-subscribe__trg');
      $field = $form.find('.js-subscribe__field');
      $form
        .on(`submit${eventNamespace}`, (e) => {
          e.preventDefault();
          that.submit();
        })
        .on(`click${eventNamespace}`, '.js-subscribe__trg', () => that.toggle())
        .on(`keydown${eventNamespace}`, function (e) {
          if (e.keyCode === 27) {
            that.close();
            $trigger.data('comp.button').toggle(false);
          }
        });
    },
    destroy() {
      $form.off(eventNamespace);
      $form = null;
      $trigger = null;
      $field = null;
    },
  };
});
