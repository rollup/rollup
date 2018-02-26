System.register(['./_arraySampleSize.js', './_baseSampleSize.js', './isArray.js', './_isIterateeCall.js', './toInteger.js'], function (exports, module) {
  'use strict';
  var arraySampleSize, baseSampleSize, isArray, isIterateeCall, toInteger;
  return {
    setters: [function (module) {
      arraySampleSize = module.default;
    }, function (module) {
      baseSampleSize = module.default;
    }, function (module) {
      isArray = module.default;
    }, function (module) {
      isIterateeCall = module.default;
    }, function (module) {
      toInteger = module.default;
    }],
    execute: function () {

      /**
       * Gets `n` random elements at unique keys from `collection` up to the
       * size of `collection`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Collection
       * @param {Array|Object} collection The collection to sample.
       * @param {number} [n=1] The number of elements to sample.
       * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
       * @returns {Array} Returns the random elements.
       * @example
       *
       * _.sampleSize([1, 2, 3], 2);
       * // => [3, 1]
       *
       * _.sampleSize([1, 2, 3], 4);
       * // => [2, 3, 1]
       */
      function sampleSize(collection, n, guard) {
        if ((guard ? isIterateeCall(collection, n, guard) : n === undefined)) {
          n = 1;
        } else {
          n = toInteger(n);
        }
        var func = isArray(collection) ? arraySampleSize : baseSampleSize;
        return func(collection, n);
      }
      exports('default', sampleSize);

    }
  };
});
