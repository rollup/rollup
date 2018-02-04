define(['./_arrayFilter.js', './_baseRest.js', './_baseXor.js', './isArrayLikeObject.js'], function (___arrayFilter_js, ___baseRest_js, ___baseXor_js, __isArrayLikeObject_js) { 'use strict';

  /**
   * Creates an array of unique values that is the
   * [symmetric difference](https://en.wikipedia.org/wiki/Symmetric_difference)
   * of the given arrays. The order of result values is determined by the order
   * they occur in the arrays.
   *
   * @static
   * @memberOf _
   * @since 2.4.0
   * @category Array
   * @param {...Array} [arrays] The arrays to inspect.
   * @returns {Array} Returns the new array of filtered values.
   * @see _.difference, _.without
   * @example
   *
   * _.xor([2, 1], [2, 3]);
   * // => [1, 3]
   */
  var xor = ___baseRest_js.default(function(arrays) {
    return ___baseXor_js.default(___arrayFilter_js.default(arrays, __isArrayLikeObject_js.default));
  });

  return xor;

});
