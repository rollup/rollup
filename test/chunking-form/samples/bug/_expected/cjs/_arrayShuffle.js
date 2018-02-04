'use strict';

var ___copyArray_js = require('./_copyArray.js');
var ___shuffleSelf_js = require('./_shuffleSelf.js');

/**
 * A specialized version of `_.shuffle` for arrays.
 *
 * @private
 * @param {Array} array The array to shuffle.
 * @returns {Array} Returns the new shuffled array.
 */
function arrayShuffle(array) {
  return ___shuffleSelf_js.default(___copyArray_js.default(array));
}

module.exports = arrayShuffle;
