'use strict';

var __isSymbol_js = require('./isSymbol.js');

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/**
 * The base implementation of `_.toNumber` which doesn't ensure correct
 * conversions of binary, hexadecimal, or octal string values.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 */
function baseToNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (__isSymbol_js.default(value)) {
    return NAN;
  }
  return +value;
}

module.exports = baseToNumber;
