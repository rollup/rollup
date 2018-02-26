System.register(['./_baseSum.js'], function (exports, module) {
  'use strict';
  var baseSum;
  return {
    setters: [function (module) {
      baseSum = module.default;
    }],
    execute: function () {

      /** Used as references for various `Number` constants. */
      var NAN = 0 / 0;

      /**
       * The base implementation of `_.mean` and `_.meanBy` without support for
       * iteratee shorthands.
       *
       * @private
       * @param {Array} array The array to iterate over.
       * @param {Function} iteratee The function invoked per iteration.
       * @returns {number} Returns the mean.
       */
      function baseMean(array, iteratee) {
        var length = array == null ? 0 : array.length;
        return length ? (baseSum(array, iteratee) / length) : NAN;
      }
      exports('default', baseMean);

    }
  };
});
