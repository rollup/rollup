define(['./_arrayFilter.js', './_baseIteratee.js', './_baseRest.js', './_baseXor.js', './isArrayLikeObject.js', './last.js'], function (___arrayFilter_js, ___baseIteratee_js, ___baseRest_js, ___baseXor_js, __isArrayLikeObject_js, __last_js) { 'use strict';

  /**
   * This method is like `_.xor` except that it accepts `iteratee` which is
   * invoked for each element of each `arrays` to generate the criterion by
   * which by which they're compared. The order of result values is determined
   * by the order they occur in the arrays. The iteratee is invoked with one
   * argument: (value).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Array
   * @param {...Array} [arrays] The arrays to inspect.
   * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
   * @returns {Array} Returns the new array of filtered values.
   * @example
   *
   * _.xorBy([2.1, 1.2], [2.3, 3.4], Math.floor);
   * // => [1.2, 3.4]
   *
   * // The `_.property` iteratee shorthand.
   * _.xorBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x');
   * // => [{ 'x': 2 }]
   */
  var xorBy = ___baseRest_js.default(function(arrays) {
    var iteratee = __last_js.default(arrays);
    if (__isArrayLikeObject_js.default(iteratee)) {
      iteratee = undefined;
    }
    return ___baseXor_js.default(___arrayFilter_js.default(arrays, __isArrayLikeObject_js.default), ___baseIteratee_js.default(iteratee, 2));
  });

  return xorBy;

});
