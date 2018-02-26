'use strict';

var __constant_js = require('./constant.js');
var ___defineProperty_js = require('./_defineProperty.js');
var __identity_js = require('./identity.js');

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !___defineProperty_js.default ? __identity_js.default : function(func, string) {
  return ___defineProperty_js.default(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': __constant_js.default(string),
    'writable': true
  });
};

module.exports = baseSetToString;
