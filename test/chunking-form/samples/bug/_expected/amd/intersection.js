define(['./_arrayMap.js', './_baseIntersection.js', './_baseRest.js', './_castArrayLikeObject.js'], function (___arrayMap_js, ___baseIntersection_js, ___baseRest_js, ___castArrayLikeObject_js) { 'use strict';

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
  var intersection = ___baseRest_js.default(function(arrays) {
    var mapped = ___arrayMap_js.default(arrays, ___castArrayLikeObject_js.default);
    return (mapped.length && mapped[0] === arrays[0])
      ? ___baseIntersection_js.default(mapped)
      : [];
  });

  return intersection;

});
