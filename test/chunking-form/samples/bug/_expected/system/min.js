System.register(['./_baseExtremum.js', './_baseLt.js', './identity.js'], function (exports, module) {
  'use strict';
  var baseExtremum, baseLt, identity;
  return {
    setters: [function (module) {
      baseExtremum = module.default;
    }, function (module) {
      baseLt = module.default;
    }, function (module) {
      identity = module.default;
    }],
    execute: function () {

      /**
       * Computes the minimum value of `array`. If `array` is empty or falsey,
       * `undefined` is returned.
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category Math
       * @param {Array} array The array to iterate over.
       * @returns {*} Returns the minimum value.
       * @example
       *
       * _.min([4, 2, 8, 6]);
       * // => 2
       *
       * _.min([]);
       * // => undefined
       */
      function min(array) {
        return (array && array.length)
          ? baseExtremum(array, identity, baseLt)
          : undefined;
      }
      exports('default', min);

    }
  };
});
