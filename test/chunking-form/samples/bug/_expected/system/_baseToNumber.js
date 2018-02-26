System.register(['./isSymbol.js'], function (exports, module) {
  'use strict';
  var isSymbol;
  return {
    setters: [function (module) {
      isSymbol = module.default;
    }],
    execute: function () {

      /** Used as references for various `Number` constants. */
      var NAN = 0 / 0;

      /**
       * The base implementation of `_.toNumber` which doesn't ensure correct
       * conversions of binary, hexadecimal, or octal string values.
       *
       * @private
       * @param {*} value The value to process.
       * @returns {number} Returns the number.
       */
      function baseToNumber(value) {
        if (typeof value == 'number') {
          return value;
        }
        if (isSymbol(value)) {
          return NAN;
        }
        return +value;
      }
      exports('default', baseToNumber);

    }
  };
});
