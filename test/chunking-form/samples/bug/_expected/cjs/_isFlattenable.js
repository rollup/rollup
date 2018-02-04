'use strict';

var ___Symbol_js = require('./_Symbol.js');
var __isArguments_js = require('./isArguments.js');
var __isArray_js = require('./isArray.js');

/** Built-in value references. */
var spreadableSymbol = ___Symbol_js.default ? ___Symbol_js.default.isConcatSpreadable : undefined;

/**
 * Checks if `value` is a flattenable `arguments` object or array.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
 */
function isFlattenable(value) {
  return __isArray_js.default(value) || __isArguments_js.default(value) ||
    !!(spreadableSymbol && value && value[spreadableSymbol]);
}

module.exports = isFlattenable;
