System.register(['./_baseToString.js', './_castSlice.js', './_charsEndIndex.js', './_charsStartIndex.js', './_stringToArray.js', './toString.js'], function (exports, module) {
  'use strict';
  var baseToString, castSlice, charsEndIndex, charsStartIndex, stringToArray, toString;
  return {
    setters: [function (module) {
      baseToString = module.default;
    }, function (module) {
      castSlice = module.default;
    }, function (module) {
      charsEndIndex = module.default;
    }, function (module) {
      charsStartIndex = module.default;
    }, function (module) {
      stringToArray = module.default;
    }, function (module) {
      toString = module.default;
    }],
    execute: function () {

      /** Used to match leading and trailing whitespace. */
      var reTrim = /^\s+|\s+$/g;

      /**
       * Removes leading and trailing whitespace or specified characters from `string`.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category String
       * @param {string} [string=''] The string to trim.
       * @param {string} [chars=whitespace] The characters to trim.
       * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
       * @returns {string} Returns the trimmed string.
       * @example
       *
       * _.trim('  abc  ');
       * // => 'abc'
       *
       * _.trim('-_-abc-_-', '_-');
       * // => 'abc'
       *
       * _.map(['  foo  ', '  bar  '], _.trim);
       * // => ['foo', 'bar']
       */
      function trim(string, chars, guard) {
        string = toString(string);
        if (string && (guard || chars === undefined)) {
          return string.replace(reTrim, '');
        }
        if (!string || !(chars = baseToString(chars))) {
          return string;
        }
        var strSymbols = stringToArray(string),
            chrSymbols = stringToArray(chars),
            start = charsStartIndex(strSymbols, chrSymbols),
            end = charsEndIndex(strSymbols, chrSymbols) + 1;

        return castSlice(strSymbols, start, end).join('');
      }
      exports('default', trim);

    }
  };
});
