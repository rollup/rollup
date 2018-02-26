'use strict';

var ___arrayFilter_js = require('./_arrayFilter.js');
var ___baseIteratee_js = require('./_baseIteratee.js');
var ___baseRest_js = require('./_baseRest.js');
var ___baseXor_js = require('./_baseXor.js');
var __isArrayLikeObject_js = require('./isArrayLikeObject.js');
var __last_js = require('./last.js');

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

module.exports = xorBy;
