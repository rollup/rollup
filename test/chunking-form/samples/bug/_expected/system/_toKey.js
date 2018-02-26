System.register(['./isSymbol.js'], function (exports, module) {
  'use strict';
  var isSymbol;
  return {
    setters: [function (module) {
      isSymbol = module.default;
    }],
    execute: function () {

      /** Used as references for various `Number` constants. */
      var INFINITY = 1 / 0;

      /**
       * Converts `value` to a string key if it's not a string or symbol.
       *
       * @private
       * @param {*} value The value to inspect.
       * @returns {string|symbol} Returns the key.
       */
      function toKey(value) {
        if (typeof value == 'string' || isSymbol(value)) {
          return value;
        }
        var result = (value + '');
        return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
      }
      exports('default', toKey);

    }
  };
});
