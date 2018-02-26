System.register(['./_baseClamp.js', './_shuffleSelf.js', './values.js'], function (exports, module) {
  'use strict';
  var baseClamp, shuffleSelf, values;
  return {
    setters: [function (module) {
      baseClamp = module.default;
    }, function (module) {
      shuffleSelf = module.default;
    }, function (module) {
      values = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of `_.sampleSize` without param guards.
       *
       * @private
       * @param {Array|Object} collection The collection to sample.
       * @param {number} n The number of elements to sample.
       * @returns {Array} Returns the random elements.
       */
      function baseSampleSize(collection, n) {
        var array = values(collection);
        return shuffleSelf(array, baseClamp(n, 0, array.length));
      }
      exports('default', baseSampleSize);

    }
  };
});
