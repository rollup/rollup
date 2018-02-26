define(['./_arrayFilter.js', './_baseRest.js', './_baseXor.js', './isArrayLikeObject.js', './last.js'], function (___arrayFilter_js, ___baseRest_js, ___baseXor_js, __isArrayLikeObject_js, __last_js) { 'use strict';

  /**
   * This method is like `_.xor` except that it accepts `comparator` which is
   * invoked to compare elements of `arrays`. The order of result values is
   * determined by the order they occur in the arrays. The comparator is invoked
   * with two arguments: (arrVal, othVal).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Array
   * @param {...Array} [arrays] The arrays to inspect.
   * @param {Function} [comparator] The comparator invoked per element.
   * @returns {Array} Returns the new array of filtered values.
   * @example
   *
   * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
   * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
   *
   * _.xorWith(objects, others, _.isEqual);
   * // => [{ 'x': 2, 'y': 1 }, { 'x': 1, 'y': 1 }]
   */
  var xorWith = ___baseRest_js.default(function(arrays) {
    var comparator = __last_js.default(arrays);
    comparator = typeof comparator == 'function' ? comparator : undefined;
    return ___baseXor_js.default(___arrayFilter_js.default(arrays, __isArrayLikeObject_js.default), undefined, comparator);
  });

  return xorWith;

});
