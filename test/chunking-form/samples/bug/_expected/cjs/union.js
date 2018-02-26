'use strict';

var ___baseFlatten_js = require('./_baseFlatten.js');
var ___baseRest_js = require('./_baseRest.js');
var ___baseUniq_js = require('./_baseUniq.js');
var __isArrayLikeObject_js = require('./isArrayLikeObject.js');

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

module.exports = union;
