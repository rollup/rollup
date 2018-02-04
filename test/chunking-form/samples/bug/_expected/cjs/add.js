'use strict';

var ___createMathOperation_js = require('./_createMathOperation.js');

/**
 * Adds two numbers.
 *
 * @static
 * @memberOf _
 * @since 3.4.0
 * @category Math
 * @param {number} augend The first number in an addition.
 * @param {number} addend The second number in an addition.
 * @returns {number} Returns the total.
 * @example
 *
 * _.add(6, 4);
 * // => 10
 */
var add = ___createMathOperation_js.default(function(augend, addend) {
  return augend + addend;
}, 0);

module.exports = add;
