define(['./_baseFlatten.js', './_baseRest.js', './_baseUniq.js', './isArrayLikeObject.js'], function (___baseFlatten_js, ___baseRest_js, ___baseUniq_js, __isArrayLikeObject_js) { 'use strict';

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
  var union = ___baseRest_js.default(function(arrays) {
    return ___baseUniq_js.default(___baseFlatten_js.default(arrays, 1, __isArrayLikeObject_js.default, true));
  });

  return union;

});
