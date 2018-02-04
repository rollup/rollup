System.register(['./_basePropertyOf.js'], function (exports, module) {
  'use strict';
  var basePropertyOf;
  return {
    setters: [function (module) {
      basePropertyOf = module.default;
    }],
    execute: function () {

      /** Used to map HTML entities to characters. */
      var htmlUnescapes = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'"
      };

      /**
       * Used by `_.unescape` to convert HTML entities to characters.
       *
       * @private
       * @param {string} chr The matched character to unescape.
       * @returns {string} Returns the unescaped character.
       */
      var unescapeHtmlChar = basePropertyOf(htmlUnescapes);
      exports('default', unescapeHtmlChar);

    }
  };
});
