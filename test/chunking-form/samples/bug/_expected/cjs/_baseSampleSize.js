'use strict';

var ___baseClamp_js = require('./_baseClamp.js');
var ___shuffleSelf_js = require('./_shuffleSelf.js');
var __values_js = require('./values.js');

/**
 * The base implementation of `_.sampleSize` without param guards.
 *
 * @private
 * @param {Array|Object} collection The collection to sample.
 * @param {number} n The number of elements to sample.
 * @returns {Array} Returns the random elements.
 */
function baseSampleSize(collection, n) {
  var array = __values_js.default(collection);
  return ___shuffleSelf_js.default(array, ___baseClamp_js.default(n, 0, array.length));
}

module.exports = baseSampleSize;
