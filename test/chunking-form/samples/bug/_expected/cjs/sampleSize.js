'use strict';

var ___arraySampleSize_js = require('./_arraySampleSize.js');
var ___baseSampleSize_js = require('./_baseSampleSize.js');
var __isArray_js = require('./isArray.js');
var ___isIterateeCall_js = require('./_isIterateeCall.js');
var __toInteger_js = require('./toInteger.js');

/**
 * Gets `n` random elements at unique keys from `collection` up to the
 * size of `collection`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Collection
 * @param {Array|Object} collection The collection to sample.
 * @param {number} [n=1] The number of elements to sample.
 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
 * @returns {Array} Returns the random elements.
 * @example
 *
 * _.sampleSize([1, 2, 3], 2);
 * // => [3, 1]
 *
 * _.sampleSize([1, 2, 3], 4);
 * // => [2, 3, 1]
 */
function sampleSize(collection, n, guard) {
  if ((guard ? ___isIterateeCall_js.default(collection, n, guard) : n === undefined)) {
    n = 1;
  } else {
    n = __toInteger_js.default(n);
  }
  var func = __isArray_js.default(collection) ? ___arraySampleSize_js.default : ___baseSampleSize_js.default;
  return func(collection, n);
}

module.exports = sampleSize;
