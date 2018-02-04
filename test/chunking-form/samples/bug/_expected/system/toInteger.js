System.register(['./toFinite.js'], function (exports, module) {
  'use strict';
  var toFinite;
  return {
    setters: [function (module) {
      toFinite = module.default;
    }],
    execute: function () {

      /**
       * Converts `value` to an integer.
       *
       * **Note:** This method is loosely based on
       * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Lang
       * @param {*} value The value to convert.
       * @returns {number} Returns the converted integer.
       * @example
       *
       * _.toInteger(3.2);
       * // => 3
       *
       * _.toInteger(Number.MIN_VALUE);
       * // => 0
       *
       * _.toInteger(Infinity);
       * // => 1.7976931348623157e+308
       *
       * _.toInteger('3.2');
       * // => 3
       */
      function toInteger(value) {
        var result = toFinite(value),
            remainder = result % 1;

        return result === result ? (remainder ? result - remainder : result) : 0;
      }
      exports('default', toInteger);

    }
  };
});
