'use strict';

var ___arraySample_js = require('./_arraySample.js');
var __values_js = require('./values.js');

/**
 * The base implementation of `_.sample`.
 *
 * @private
 * @param {Array|Object} collection The collection to sample.
 * @returns {*} Returns the random element.
 */
function baseSample(collection) {
  return ___arraySample_js.default(__values_js.default(collection));
}

module.exports = baseSample;
