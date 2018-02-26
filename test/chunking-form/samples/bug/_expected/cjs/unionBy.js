'use strict';

var ___baseFlatten_js = require('./_baseFlatten.js');
var ___baseIteratee_js = require('./_baseIteratee.js');
var ___baseRest_js = require('./_baseRest.js');
var ___baseUniq_js = require('./_baseUniq.js');
var __isArrayLikeObject_js = require('./isArrayLikeObject.js');
var __last_js = require('./last.js');

/**
 * This method is like `_.union` except that it accepts `iteratee` which is
 * invoked for each element of each `arrays` to generate the criterion by
 * which uniqueness is computed. Result values are chosen from the first
 * array in which the value occurs. The iteratee is invoked with one argument:
 * (value).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Array
 * @param {...Array} [arrays] The arrays to inspect.
 * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
 * @returns {Array} Returns the new array of combined values.
 * @example
 *
 * _.unionBy([2.1], [1.2, 2.3], Math.floor);
 * // => [2.1, 1.2]
 *
 * // The `_.property` iteratee shorthand.
 * _.unionBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x');
 * // => [{ 'x': 1 }, { 'x': 2 }]
 */
var unionBy = ___baseRest_js.default(function(arrays) {
  var iteratee = __last_js.default(arrays);
  if (__isArrayLikeObject_js.default(iteratee)) {
    iteratee = undefined;
  }
  return ___baseUniq_js.default(___baseFlatten_js.default(arrays, 1, __isArrayLikeObject_js.default, true), ___baseIteratee_js.default(iteratee, 2));
});

module.exports = unionBy;
