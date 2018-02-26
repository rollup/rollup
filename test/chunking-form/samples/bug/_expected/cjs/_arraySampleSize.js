'use strict';

var ___baseClamp_js = require('./_baseClamp.js');
var ___copyArray_js = require('./_copyArray.js');
var ___shuffleSelf_js = require('./_shuffleSelf.js');

/**
 * A specialized version of `_.sampleSize` for arrays.
 *
 * @private
 * @param {Array} array The array to sample.
 * @param {number} n The number of elements to sample.
 * @returns {Array} Returns the random elements.
 */
function arraySampleSize(array, n) {
  return ___shuffleSelf_js.default(___copyArray_js.default(array), ___baseClamp_js.default(n, 0, array.length));
}

module.exports = arraySampleSize;
