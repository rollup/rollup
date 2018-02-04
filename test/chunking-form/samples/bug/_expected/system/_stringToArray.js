System.register(['./_asciiToArray.js', './_hasUnicode.js', './_unicodeToArray.js'], function (exports, module) {
  'use strict';
  var asciiToArray, hasUnicode, unicodeToArray;
  return {
    setters: [function (module) {
      asciiToArray = module.default;
    }, function (module) {
      hasUnicode = module.default;
    }, function (module) {
      unicodeToArray = module.default;
    }],
    execute: function () {

      /**
       * Converts `string` to an array.
       *
       * @private
       * @param {string} string The string to convert.
       * @returns {Array} Returns the converted array.
       */
      function stringToArray(string) {
        return hasUnicode(string)
          ? unicodeToArray(string)
          : asciiToArray(string);
      }
      exports('default', stringToArray);

    }
  };
});
