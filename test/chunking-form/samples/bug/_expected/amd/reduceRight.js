define(['./_arrayReduceRight.js', './_baseEachRight.js', './_baseIteratee.js', './_baseReduce.js', './isArray.js'], function (___arrayReduceRight_js, ___baseEachRight_js, ___baseIteratee_js, ___baseReduce_js, __isArray_js) { 'use strict';

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
    var func = __isArray_js.default(collection) ? ___arrayReduceRight_js.default : ___baseReduce_js.default,
        initAccum = arguments.length < 3;

    return func(collection, ___baseIteratee_js.default(iteratee, 4), accumulator, initAccum, ___baseEachRight_js.default);
  }

  return reduceRight;

});
