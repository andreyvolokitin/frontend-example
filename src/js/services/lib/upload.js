import $ from 'jquery';
import 'blueimp-file-upload';
import 'blueimp-file-upload/css/jquery.fileupload.css';

const uploadKlass = 'upload';
const inputKlass = `${uploadKlass}__input`;
const legendKlass = `${uploadKlass}__legend`;
const progressKlass = `${uploadKlass}__progress`;
const progressbarKlass = `${uploadKlass}__progress-bar`;
const focusKlass = 'is-focused';
const visibleKlass = 'is-visible';
const disabledKlass = 'is-disabled';

$(document).on('focus blur', `.${inputKlass}`, function (e) {
  $(this)
    .closest(`.${uploadKlass}`)
    .toggleClass(focusKlass, e.type === 'focus');
});

// https://github.com/blueimp/jQuery-File-Upload/wiki
const defaultMethods = {
  done(e, data) {
    $.each(data.result.files, function (index, file) {
      $('<p/>')
        .text(file.name)
        .appendTo($(e.target).find(`.${legendKlass}`));
    });
  },
  progressall(e, data) {
    const $container = $(e.target).closest(`.${uploadKlass}`);

    $container
      .find(`.${progressbarKlass}`)
      .css('width', `${parseInt((data.loaded / data.total) * 100, 10)}%`);
  },
  start(e) {
    $(e.target).closest(`.${uploadKlass}`).find(`.${progressKlass}`).addClass(visibleKlass);
  },
};
const defaults = {};

function initUpload($element, options) {
  const finalOpts = $.extend({}, defaults, options);

  // don't overwrite methods
  Object.keys(defaultMethods).forEach((methodName) => {
    const originalMethod = finalOpts[methodName];

    if (typeof originalMethod === 'function') {
      finalOpts[methodName] = function (...args) {
        defaultMethods[methodName](...args);
        originalMethod(...args);
      };
    } else {
      finalOpts[methodName] = defaultMethods[methodName];
    }
  });

  $element
    .fileupload(finalOpts)
    .prop('disabled', !$.support.fileInput)
    .parent()
    .toggleClass(disabledKlass, $.support.fileInput);
}

export default initUpload;
