'use strict';

var ___createMathOperation_js = require('./_createMathOperation.js');

/**
 * Subtract two numbers.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Math
 * @param {number} minuend The first number in a subtraction.
 * @param {number} subtrahend The second number in a subtraction.
 * @returns {number} Returns the difference.
 * @example
 *
 * _.subtract(6, 4);
 * // => 2
 */
var subtract = ___createMathOperation_js.default(function(minuend, subtrahend) {
  return minuend - subtrahend;
}, 0);

module.exports = subtract;
