System.register(['./_baseFlatten.js', './_baseRest.js', './_baseUniq.js', './isArrayLikeObject.js'], function (exports, module) {
  'use strict';
  var baseFlatten, baseRest, baseUniq, isArrayLikeObject;
  return {
    setters: [function (module) {
      baseFlatten = module.default;
    }, function (module) {
      baseRest = module.default;
    }, function (module) {
      baseUniq = module.default;
    }, function (module) {
      isArrayLikeObject = module.default;
    }],
    execute: function () {

      /**
       * Creates an array of unique values, in order, from all given arrays using
       * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
       * for equality comparisons.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Array
       * @param {...Array} [arrays] The arrays to inspect.
       * @returns {Array} Returns the new array of combined values.
       * @example
       *
       * _.union([2], [1, 2]);
       * // => [2, 1]
       */
      var union = baseRest(function(arrays) {
        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
      });
      exports('default', union);

    }
  };
});
