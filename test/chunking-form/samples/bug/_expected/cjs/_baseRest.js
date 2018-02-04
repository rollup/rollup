'use strict';

var __identity_js = require('./identity.js');
var ___overRest_js = require('./_overRest.js');
var ___setToString_js = require('./_setToString.js');

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  return ___setToString_js.default(___overRest_js.default(func, start, __identity_js.default), func + '');
}

module.exports = baseRest;
