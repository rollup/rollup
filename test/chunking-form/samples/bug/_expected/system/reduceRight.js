System.register(['./_arrayReduceRight.js', './_baseEachRight.js', './_baseIteratee.js', './_baseReduce.js', './isArray.js'], function (exports, module) {
  'use strict';
  var arrayReduceRight, baseEachRight, baseIteratee, baseReduce, isArray;
  return {
    setters: [function (module) {
      arrayReduceRight = module.default;
    }, function (module) {
      baseEachRight = module.default;
    }, function (module) {
      baseIteratee = module.default;
    }, function (module) {
      baseReduce = module.default;
    }, function (module) {
      isArray = module.default;
    }],
    execute: function () {

      /**
       * This method is like `_.reduce` except that it iterates over elements of
       * `collection` from right to left.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Collection
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} [iteratee=_.identity] The function invoked per iteration.
       * @param {*} [accumulator] The initial value.
       * @returns {*} Returns the accumulated value.
       * @see _.reduce
       * @example
       *
       * var array = [[0, 1], [2, 3], [4, 5]];
       *
       * _.reduceRight(array, function(flattened, other) {
       *   return flattened.concat(other);
       * }, []);
       * // => [4, 5, 2, 3, 0, 1]
       */
      function reduceRight(collection, iteratee, accumulator) {
        var func = isArray(collection) ? arrayReduceRight : baseReduce,
            initAccum = arguments.length < 3;

        return func(collection, baseIteratee(iteratee, 4), accumulator, initAccum, baseEachRight);
      }
      exports('default', reduceRight);

    }
  };
});
