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

      /**
       * Pads `string` on the right side if it's shorter than `length`. Padding
       * characters are truncated if they exceed `length`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category String
       * @param {string} [string=''] The string to pad.
       * @param {number} [length=0] The padding length.
       * @param {string} [chars=' '] The string used as padding.
       * @returns {string} Returns the padded string.
       * @example
       *
       * _.padEnd('abc', 6);
       * // => 'abc   '
       *
       * _.padEnd('abc', 6, '_-');
       * // => 'abc_-_'
       *
       * _.padEnd('abc', 3);
       * // => 'abc'
       */
      function padEnd(string, length, chars) {
        string = toString(string);
        length = toInteger(length);

        var strLength = length ? stringSize(string) : 0;
        return (length && strLength < length)
          ? (string + createPadding(length - strLength, chars))
          : string;
      }
      exports('default', padEnd);

    }
  };
});
