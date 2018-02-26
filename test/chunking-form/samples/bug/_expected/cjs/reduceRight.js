'use strict';

var ___arrayReduceRight_js = require('./_arrayReduceRight.js');
var ___baseEachRight_js = require('./_baseEachRight.js');
var ___baseIteratee_js = require('./_baseIteratee.js');
var ___baseReduce_js = require('./_baseReduce.js');
var __isArray_js = require('./isArray.js');

/**
 * This method is like `_.reduce` except that it iterates over elements of
 * `collection` from right to left.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @returns {*} Returns the accumulated value.
 * @see _.reduce
 * @example
 *
 * var array = [[0, 1], [2, 3], [4, 5]];
 *
 * _.reduceRight(array, function(flattened, other) {
 *   return flattened.concat(other);
 * }, []);
 * // => [4, 5, 2, 3, 0, 1]
 */
function reduceRight(collection, iteratee, accumulator) {
  var func = __isArray_js.default(collection) ? ___arrayReduceRight_js.default : ___baseReduce_js.default,
      initAccum = arguments.length < 3;

  return func(collection, ___baseIteratee_js.default(iteratee, 4), accumulator, initAccum, ___baseEachRight_js.default);
}

module.exports = reduceRight;
