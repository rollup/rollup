System.register(['./_Symbol.js', './isArguments.js', './isArray.js'], function (exports, module) {
  'use strict';
  var Symbol, isArguments, isArray;
  return {
    setters: [function (module) {
      Symbol = module.default;
    }, function (module) {
      isArguments = module.default;
    }, function (module) {
      isArray = module.default;
    }],
    execute: function () {

      /** Built-in value references. */
      var spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined;

      /**
       * Checks if `value` is a flattenable `arguments` object or array.
       *
       * @private
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
       */
      function isFlattenable(value) {
        return isArray(value) || isArguments(value) ||
          !!(spreadableSymbol && value && value[spreadableSymbol]);
      }
      exports('default', isFlattenable);

    }
  };
});
