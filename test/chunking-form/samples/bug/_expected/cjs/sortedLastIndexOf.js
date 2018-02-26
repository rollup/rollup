'use strict';

var ___baseSortedIndex_js = require('./_baseSortedIndex.js');
var __eq_js = require('./eq.js');

/**
 * This method is like `_.lastIndexOf` except that it performs a binary
 * search on a sorted `array`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 * @example
 *
 * _.sortedLastIndexOf([4, 5, 5, 5, 6], 5);
 * // => 3
 */
function sortedLastIndexOf(array, value) {
  var length = array == null ? 0 : array.length;
  if (length) {
    var index = ___baseSortedIndex_js.default(array, value, true) - 1;
    if (__eq_js.default(array[index], value)) {
      return index;
    }
  }
  return -1;
}

module.exports = sortedLastIndexOf;
