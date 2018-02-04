System.register(['./_arrayMap.js', './_baseIntersection.js', './_baseRest.js', './_castArrayLikeObject.js'], function (exports, module) {
  'use strict';
  var arrayMap, baseIntersection, baseRest, castArrayLikeObject;
  return {
    setters: [function (module) {
      arrayMap = module.default;
    }, function (module) {
      baseIntersection = module.default;
    }, function (module) {
      baseRest = module.default;
    }, function (module) {
      castArrayLikeObject = module.default;
    }],
    execute: function () {

      /**
       * Creates an array of unique values that are included in all given arrays
       * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
       * for equality comparisons. The order and references of result values are
       * determined by the first array.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Array
       * @param {...Array} [arrays] The arrays to inspect.
       * @returns {Array} Returns the new array of intersecting values.
       * @example
       *
       * _.intersection([2, 1], [2, 3]);
       * // => [2]
       */
      var intersection = baseRest(function(arrays) {
        var mapped = arrayMap(arrays, castArrayLikeObject);
        return (mapped.length && mapped[0] === arrays[0])
          ? baseIntersection(mapped)
          : [];
      });
      exports('default', intersection);

    }
  };
});
