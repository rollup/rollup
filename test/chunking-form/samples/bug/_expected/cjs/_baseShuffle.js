'use strict';

var ___shuffleSelf_js = require('./_shuffleSelf.js');
var __values_js = require('./values.js');

/**
 * The base implementation of `_.shuffle`.
 *
 * @private
 * @param {Array|Object} collection The collection to shuffle.
 * @returns {Array} Returns the new shuffled array.
 */
function baseShuffle(collection) {
  return ___shuffleSelf_js.default(__values_js.default(collection));
}

module.exports = baseShuffle;
