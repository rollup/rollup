'use strict';

var ___baseRandom_js = require('./_baseRandom.js');

/**
 * A specialized version of `_.sample` for arrays.
 *
 * @private
 * @param {Array} array The array to sample.
 * @returns {*} Returns the random element.
 */
function arraySample(array) {
  var length = array.length;
  return length ? array[___baseRandom_js.default(0, length - 1)] : undefined;
}

module.exports = arraySample;
