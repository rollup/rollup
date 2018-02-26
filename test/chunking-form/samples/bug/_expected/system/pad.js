System.register(['./_createPadding.js', './_stringSize.js', './toInteger.js', './toString.js'], function (exports, module) {
  'use strict';
  var createPadding, stringSize, toInteger, toString;
  return {
    setters: [function (module) {
      createPadding = module.default;
    }, function (module) {
      stringSize = module.default;
    }, function (module) {
      toInteger = module.default;
    }, function (module) {
      toString = module.default;
    }],
    execute: function () {

      /* Built-in method references for those with the same name as other `lodash` methods. */
      var nativeCeil = Math.ceil,
          nativeFloor = Math.floor;

      /**
       * Pads `string` on the left and right sides if it's shorter than `length`.
       * Padding characters are truncated if they can't be evenly divided by `length`.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category String
       * @param {string} [string=''] The string to pad.
       * @param {number} [length=0] The padding length.
       * @param {string} [chars=' '] The string used as padding.
       * @returns {string} Returns the padded string.
       * @example
       *
       * _.pad('abc', 8);
       * // => '  abc   '
       *
       * _.pad('abc', 8, '_-');
       * // => '_-abc_-_'
       *
       * _.pad('abc', 3);
       * // => 'abc'
       */
      function pad(string, length, chars) {
        string = toString(string);
        length = toInteger(length);

        var strLength = length ? stringSize(string) : 0;
        if (!length || strLength >= length) {
          return string;
        }
        var mid = (length - strLength) / 2;
        return (
          createPadding(nativeFloor(mid), chars) +
          string +
          createPadding(nativeCeil(mid), chars)
        );
      }
      exports('default', pad);

    }
  };
});
