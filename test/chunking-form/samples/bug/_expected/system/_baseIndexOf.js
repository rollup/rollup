System.register(['./_baseFindIndex.js', './_baseIsNaN.js', './_strictIndexOf.js'], function (exports, module) {
  'use strict';
  var baseFindIndex, baseIsNaN, strictIndexOf;
  return {
    setters: [function (module) {
      baseFindIndex = module.default;
    }, function (module) {
      baseIsNaN = module.default;
    }, function (module) {
      strictIndexOf = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
       *
       * @private
       * @param {Array} array The array to inspect.
       * @param {*} value The value to search for.
       * @param {number} fromIndex The index to search from.
       * @returns {number} Returns the index of the matched value, else `-1`.
       */
      function baseIndexOf(array, value, fromIndex) {
        return value === value
          ? strictIndexOf(array, value, fromIndex)
          : baseFindIndex(array, baseIsNaN, fromIndex);
      }
      exports('default', baseIndexOf);

    }
  };
});
