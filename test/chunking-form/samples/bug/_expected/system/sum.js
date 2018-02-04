System.register(['./_baseSum.js', './identity.js'], function (exports, module) {
  'use strict';
  var baseSum, identity;
  return {
    setters: [function (module) {
      baseSum = module.default;
    }, function (module) {
      identity = module.default;
    }],
    execute: function () {

      /**
       * Computes the sum of the values in `array`.
       *
       * @static
       * @memberOf _
       * @since 3.4.0
       * @category Math
       * @param {Array} array The array to iterate over.
       * @returns {number} Returns the sum.
       * @example
       *
       * _.sum([4, 2, 8, 6]);
       * // => 20
       */
      function sum(array) {
        return (array && array.length)
          ? baseSum(array, identity)
          : 0;
      }
      exports('default', sum);

    }
  };
});
