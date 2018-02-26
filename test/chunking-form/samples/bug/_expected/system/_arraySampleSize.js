System.register(['./_baseClamp.js', './_copyArray.js', './_shuffleSelf.js'], function (exports, module) {
  'use strict';
  var baseClamp, copyArray, shuffleSelf;
  return {
    setters: [function (module) {
      baseClamp = module.default;
    }, function (module) {
      copyArray = module.default;
    }, function (module) {
      shuffleSelf = module.default;
    }],
    execute: function () {

      /**
       * A specialized version of `_.sampleSize` for arrays.
       *
       * @private
       * @param {Array} array The array to sample.
       * @param {number} n The number of elements to sample.
       * @returns {Array} Returns the random elements.
       */
      function arraySampleSize(array, n) {
        return shuffleSelf(copyArray(array), baseClamp(n, 0, array.length));
      }
      exports('default', arraySampleSize);

    }
  };
});
