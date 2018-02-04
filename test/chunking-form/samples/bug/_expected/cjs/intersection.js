'use strict';

var ___arrayMap_js = require('./_arrayMap.js');
var ___baseIntersection_js = require('./_baseIntersection.js');
var ___baseRest_js = require('./_baseRest.js');
var ___castArrayLikeObject_js = require('./_castArrayLikeObject.js');

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

module.exports = intersection;
