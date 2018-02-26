'use strict';

var ___arrayMap_js = require('./_arrayMap.js');
var ___baseIntersection_js = require('./_baseIntersection.js');
var ___baseRest_js = require('./_baseRest.js');
var ___castArrayLikeObject_js = require('./_castArrayLikeObject.js');
var __last_js = require('./last.js');

/**
 * This method is like `_.intersection` except that it accepts `comparator`
 * which is invoked to compare elements of `arrays`. The order and references
 * of result values are determined by the first array. The comparator is
 * invoked with two arguments: (arrVal, othVal).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Array
 * @param {...Array} [arrays] The arrays to inspect.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new array of intersecting values.
 * @example
 *
 * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
 * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
 *
 * _.intersectionWith(objects, others, _.isEqual);
 * // => [{ 'x': 1, 'y': 2 }]
 */
var intersectionWith = ___baseRest_js.default(function(arrays) {
  var comparator = __last_js.default(arrays),
      mapped = ___arrayMap_js.default(arrays, ___castArrayLikeObject_js.default);

  comparator = typeof comparator == 'function' ? comparator : undefined;
  if (comparator) {
    mapped.pop();
  }
  return (mapped.length && mapped[0] === arrays[0])
    ? ___baseIntersection_js.default(mapped, undefined, comparator)
    : [];
});

module.exports = intersectionWith;
