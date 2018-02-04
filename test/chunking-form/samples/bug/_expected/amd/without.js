define(['./_baseDifference.js', './_baseRest.js', './isArrayLikeObject.js'], function (___baseDifference_js, ___baseRest_js, __isArrayLikeObject_js) { 'use strict';

  /**
   * Creates an array excluding all given values using
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * for equality comparisons.
   *
   * **Note:** Unlike `_.pull`, this method returns a new array.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Array
   * @param {Array} array The array to inspect.
   * @param {...*} [values] The values to exclude.
   * @returns {Array} Returns the new array of filtered values.
   * @see _.difference, _.xor
   * @example
   *
   * _.without([2, 1, 2, 3], 1, 2);
   * // => [3]
   */
  var without = ___baseRest_js.default(function(array, values) {
    return __isArrayLikeObject_js.default(array)
      ? ___baseDifference_js.default(array, values)
      : [];
  });

  return without;

});
