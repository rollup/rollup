'use strict';

var ___arrayShuffle_js = require('./_arrayShuffle.js');
var ___baseShuffle_js = require('./_baseShuffle.js');
var __isArray_js = require('./isArray.js');

/**
 * Creates an array of shuffled values, using a version of the
 * [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle).
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to shuffle.
 * @returns {Array} Returns the new shuffled array.
 * @example
 *
 * _.shuffle([1, 2, 3, 4]);
 * // => [4, 1, 3, 2]
 */
function shuffle(collection) {
  var func = __isArray_js.default(collection) ? ___arrayShuffle_js.default : ___baseShuffle_js.default;
  return func(collection);
}

module.exports = shuffle;
