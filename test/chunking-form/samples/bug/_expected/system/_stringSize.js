System.register(['./_asciiSize.js', './_hasUnicode.js', './_unicodeSize.js'], function (exports, module) {
  'use strict';
  var asciiSize, hasUnicode, unicodeSize;
  return {
    setters: [function (module) {
      asciiSize = module.default;
    }, function (module) {
      hasUnicode = module.default;
    }, function (module) {
      unicodeSize = module.default;
    }],
    execute: function () {

      /**
       * Gets the number of symbols in `string`.
       *
       * @private
       * @param {string} string The string to inspect.
       * @returns {number} Returns the string size.
       */
      function stringSize(string) {
        return hasUnicode(string)
          ? unicodeSize(string)
          : asciiSize(string);
      }
      exports('default', stringSize);

    }
  };
});
