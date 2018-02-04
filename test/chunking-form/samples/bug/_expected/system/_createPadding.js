System.register(['./_baseRepeat.js', './_baseToString.js', './_castSlice.js', './_hasUnicode.js', './_stringSize.js', './_stringToArray.js'], function (exports, module) {
  'use strict';
  var baseRepeat, baseToString, castSlice, hasUnicode, stringSize, stringToArray;
  return {
    setters: [function (module) {
      baseRepeat = module.default;
    }, function (module) {
      baseToString = module.default;
    }, function (module) {
      castSlice = module.default;
    }, function (module) {
      hasUnicode = module.default;
    }, function (module) {
      stringSize = module.default;
    }, function (module) {
      stringToArray = module.default;
    }],
    execute: function () {

      /* Built-in method references for those with the same name as other `lodash` methods. */
      var nativeCeil = Math.ceil;

      /**
       * Creates the padding for `string` based on `length`. The `chars` string
       * is truncated if the number of characters exceeds `length`.
       *
       * @private
       * @param {number} length The padding length.
       * @param {string} [chars=' '] The string used as padding.
       * @returns {string} Returns the padding for `string`.
       */
      function createPadding(length, chars) {
        chars = chars === undefined ? ' ' : baseToString(chars);

        var charsLength = chars.length;
        if (charsLength < 2) {
          return charsLength ? baseRepeat(chars, length) : chars;
        }
        var result = baseRepeat(chars, nativeCeil(length / stringSize(chars)));
        return hasUnicode(chars)
          ? castSlice(stringToArray(result), 0, length).join('')
          : result.slice(0, length);
      }
      exports('default', createPadding);

    }
  };
});
