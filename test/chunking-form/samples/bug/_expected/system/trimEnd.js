System.register(['./_baseToString.js', './_castSlice.js', './_charsEndIndex.js', './_stringToArray.js', './toString.js'], function (exports, module) {
  'use strict';
  var baseToString, castSlice, charsEndIndex, stringToArray, toString;
  return {
    setters: [function (module) {
      baseToString = module.default;
    }, function (module) {
      castSlice = module.default;
    }, function (module) {
      charsEndIndex = module.default;
    }, function (module) {
      stringToArray = module.default;
    }, function (module) {
      toString = module.default;
    }],
    execute: function () {

      /** Used to match leading and trailing whitespace. */
      var reTrimEnd = /\s+$/;

      /**
       * Removes trailing whitespace or specified characters from `string`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category String
       * @param {string} [string=''] The string to trim.
       * @param {string} [chars=whitespace] The characters to trim.
       * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
       * @returns {string} Returns the trimmed string.
       * @example
       *
       * _.trimEnd('  abc  ');
       * // => '  abc'
       *
       * _.trimEnd('-_-abc-_-', '_-');
       * // => '-_-abc'
       */
      function trimEnd(string, chars, guard) {
        string = toString(string);
        if (string && (guard || chars === undefined)) {
          return string.replace(reTrimEnd, '');
        }
        if (!string || !(chars = baseToString(chars))) {
          return string;
        }
        var strSymbols = stringToArray(string),
            end = charsEndIndex(strSymbols, stringToArray(chars)) + 1;

        return castSlice(strSymbols, 0, end).join('');
      }
      exports('default', trimEnd);

    }
  };
});
