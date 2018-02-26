'use strict';

var ___arrayPush_js = require('./_arrayPush.js');
var ___baseFlatten_js = require('./_baseFlatten.js');
var ___copyArray_js = require('./_copyArray.js');
var __isArray_js = require('./isArray.js');

/**
 * Creates a new array concatenating `array` with any additional arrays
 * and/or values.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to concatenate.
 * @param {...*} [values] The values to concatenate.
 * @returns {Array} Returns the new concatenated array.
 * @example
 *
 * var array = [1];
 * var other = _.concat(array, 2, [3], [[4]]);
 *
 * console.log(other);
 * // => [1, 2, 3, [4]]
 *
 * console.log(array);
 * // => [1]
 */
function concat() {
  var length = arguments.length;
  if (!length) {
    return [];
  }
  var args = Array(length - 1),
      array = arguments[0],
      index = length;

  while (index--) {
    args[index - 1] = arguments[index];
  }
  return ___arrayPush_js.default(__isArray_js.default(array) ? ___copyArray_js.default(array) : [array], ___baseFlatten_js.default(args, 1));
}

module.exports = concat;
