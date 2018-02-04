'use strict';

var ___baseDifference_js = require('./_baseDifference.js');
var ___baseFlatten_js = require('./_baseFlatten.js');
var ___baseRest_js = require('./_baseRest.js');
var __isArrayLikeObject_js = require('./isArrayLikeObject.js');

/**
 * Creates an array of `array` values not included in the other given arrays
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons. The order and references of result values are
 * determined by the first array.
 *
 * **Note:** Unlike `_.pullAll`, this method returns a new array.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {...Array} [values] The values to exclude.
 * @returns {Array} Returns the new array of filtered values.
 * @see _.without, _.xor
 * @example
 *
 * _.difference([2, 1], [2, 3]);
 * // => [1]
 */
var difference = ___baseRest_js.default(function(array, values) {
  return __isArrayLikeObject_js.default(array)
    ? ___baseDifference_js.default(array, ___baseFlatten_js.default(values, 1, __isArrayLikeObject_js.default, true))
    : [];
});

module.exports = difference;
