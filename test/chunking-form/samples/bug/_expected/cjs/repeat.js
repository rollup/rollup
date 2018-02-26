'use strict';

var ___baseRepeat_js = require('./_baseRepeat.js');
var ___isIterateeCall_js = require('./_isIterateeCall.js');
var __toInteger_js = require('./toInteger.js');
var __toString_js = require('./toString.js');

/**
 * Repeats the given string `n` times.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to repeat.
 * @param {number} [n=1] The number of times to repeat the string.
 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
 * @returns {string} Returns the repeated string.
 * @example
 *
 * _.repeat('*', 3);
 * // => '***'
 *
 * _.repeat('abc', 2);
 * // => 'abcabc'
 *
 * _.repeat('abc', 0);
 * // => ''
 */
function repeat(string, n, guard) {
  if ((guard ? ___isIterateeCall_js.default(string, n, guard) : n === undefined)) {
    n = 1;
  } else {
    n = __toInteger_js.default(n);
  }
  return ___baseRepeat_js.default(__toString_js.default(string), n);
}

module.exports = repeat;
