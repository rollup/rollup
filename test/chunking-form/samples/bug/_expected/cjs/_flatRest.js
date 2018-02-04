'use strict';

var __flatten_js = require('./flatten.js');
var ___overRest_js = require('./_overRest.js');
var ___setToString_js = require('./_setToString.js');

/**
 * A specialized version of `baseRest` which flattens the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @returns {Function} Returns the new function.
 */
function flatRest(func) {
  return ___setToString_js.default(___overRest_js.default(func, undefined, __flatten_js.default), func + '');
}

module.exports = flatRest;
