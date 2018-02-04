System.register(['./_baseMean.js', './identity.js'], function (exports, module) {
  'use strict';
  var baseMean, identity;
  return {
    setters: [function (module) {
      baseMean = module.default;
    }, function (module) {
      identity = module.default;
    }],
    execute: function () {

      /**
       * Computes the mean of the values in `array`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Math
       * @param {Array} array The array to iterate over.
       * @returns {number} Returns the mean.
       * @example
       *
       * _.mean([4, 2, 8, 6]);
       * // => 5
       */
      function mean(array) {
        return baseMean(array, identity);
      }
      exports('default', mean);

    }
  };
});
