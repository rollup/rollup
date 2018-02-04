'use strict';

var ___Set_js = require('./_Set.js');
var __noop_js = require('./noop.js');
var ___setToArray_js = require('./_setToArray.js');

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/**
 * Creates a set object of `values`.
 *
 * @private
 * @param {Array} values The values to add to the set.
 * @returns {Object} Returns the new set.
 */
var createSet = !(___Set_js.default && (1 / ___setToArray_js.default(new ___Set_js.default([,-0]))[1]) == INFINITY) ? __noop_js.default : function(values) {
  return new ___Set_js.default(values);
};

module.exports = createSet;
