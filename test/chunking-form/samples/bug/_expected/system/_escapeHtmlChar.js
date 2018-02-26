System.register(['./_basePropertyOf.js'], function (exports, module) {
  'use strict';
  var basePropertyOf;
  return {
    setters: [function (module) {
      basePropertyOf = module.default;
    }],
    execute: function () {

      /** Used to map characters to HTML entities. */
      var htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };

      /**
       * Used by `_.escape` to convert characters to HTML entities.
       *
       * @private
       * @param {string} chr The matched character to escape.
       * @returns {string} Returns the escaped character.
       */
      var escapeHtmlChar = basePropertyOf(htmlEscapes);
      exports('default', escapeHtmlChar);

    }
  };
});
