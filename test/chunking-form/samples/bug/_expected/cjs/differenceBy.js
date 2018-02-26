'use strict';

var ___baseDifference_js = require('./_baseDifference.js');
var ___baseFlatten_js = require('./_baseFlatten.js');
var ___baseIteratee_js = require('./_baseIteratee.js');
var ___baseRest_js = require('./_baseRest.js');
var __isArrayLikeObject_js = require('./isArrayLikeObject.js');
var __last_js = require('./last.js');

/**
 * This method is like `_.difference` except that it accepts `iteratee` which
 * is invoked for each element of `array` and `values` to generate the criterion
 * by which they're compared. The order and references of result values are
 * determined by the first array. The iteratee is invoked with one argument:
 * (value).
 *
 * **Note:** Unlike `_.pullAllBy`, this method returns a new array.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {...Array} [values] The values to exclude.
 * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
 * @returns {Array} Returns the new array of filtered values.
 * @example
 *
 * _.differenceBy([2.1, 1.2], [2.3, 3.4], Math.floor);
 * // => [1.2]
 *
 * // The `_.property` iteratee shorthand.
 * _.differenceBy([{ 'x': 2 }, { 'x': 1 }], [{ 'x': 1 }], 'x');
 * // => [{ 'x': 2 }]
 */
var differenceBy = ___baseRest_js.default(function(array, values) {
  var iteratee = __last_js.default(values);
  if (__isArrayLikeObject_js.default(iteratee)) {
    iteratee = undefined;
  }
  return __isArrayLikeObject_js.default(array)
    ? ___baseDifference_js.default(array, ___baseFlatten_js.default(values, 1, __isArrayLikeObject_js.default, true), ___baseIteratee_js.default(iteratee, 2))
    : [];
});

module.exports = differenceBy;
