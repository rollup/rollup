'use strict';

var ___baseDifference_js = require('./_baseDifference.js');
var ___baseFlatten_js = require('./_baseFlatten.js');
var ___baseUniq_js = require('./_baseUniq.js');

/**
 * The base implementation of methods like `_.xor`, without support for
 * iteratee shorthands, that accepts an array of arrays to inspect.
 *
 * @private
 * @param {Array} arrays The arrays to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new array of values.
 */
function baseXor(arrays, iteratee, comparator) {
  var length = arrays.length;
  if (length < 2) {
    return length ? ___baseUniq_js.default(arrays[0]) : [];
  }
  var index = -1,
      result = Array(length);

  while (++index < length) {
    var array = arrays[index],
        othIndex = -1;

    while (++othIndex < length) {
      if (othIndex != index) {
        result[index] = ___baseDifference_js.default(result[index] || array, arrays[othIndex], iteratee, comparator);
      }
    }
  }
  return ___baseUniq_js.default(___baseFlatten_js.default(result, 1), iteratee, comparator);
}

module.exports = baseXor;
