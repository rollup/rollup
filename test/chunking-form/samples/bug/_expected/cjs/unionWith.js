'use strict';

var ___baseFlatten_js = require('./_baseFlatten.js');
var ___baseRest_js = require('./_baseRest.js');
var ___baseUniq_js = require('./_baseUniq.js');
var __isArrayLikeObject_js = require('./isArrayLikeObject.js');
var __last_js = require('./last.js');

/**
 * This method is like `_.union` except that it accepts `comparator` which
 * is invoked to compare elements of `arrays`. Result values are chosen from
 * the first array in which the value occurs. The comparator is invoked
 * with two arguments: (arrVal, othVal).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Array
 * @param {...Array} [arrays] The arrays to inspect.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new array of combined values.
 * @example
 *
 * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
 * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
 *
 * _.unionWith(objects, others, _.isEqual);
 * // => [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }, { 'x': 1, 'y': 1 }]
 */
var unionWith = ___baseRest_js.default(function(arrays) {
  var comparator = __last_js.default(arrays);
  comparator = typeof comparator == 'function' ? comparator : undefined;
  return ___baseUniq_js.default(___baseFlatten_js.default(arrays, 1, __isArrayLikeObject_js.default, true), undefined, comparator);
});

module.exports = unionWith;
