'use strict';

var ___baseClamp_js = require('./_baseClamp.js');
var ___baseToString_js = require('./_baseToString.js');
var __toInteger_js = require('./toInteger.js');
var __toString_js = require('./toString.js');

/**
 * Checks if `string` ends with the given target string.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to inspect.
 * @param {string} [target] The string to search for.
 * @param {number} [position=string.length] The position to search up to.
 * @returns {boolean} Returns `true` if `string` ends with `target`,
 *  else `false`.
 * @example
 *
 * _.endsWith('abc', 'c');
 * // => true
 *
 * _.endsWith('abc', 'b');
 * // => false
 *
 * _.endsWith('abc', 'b', 2);
 * // => true
 */
function endsWith(string, target, position) {
  string = __toString_js.default(string);
  target = ___baseToString_js.default(target);

  var length = string.length;
  position = position === undefined
    ? length
    : ___baseClamp_js.default(__toInteger_js.default(position), 0, length);

  var end = position;
  position -= target.length;
  return position >= 0 && string.slice(position, end) == target;
}

module.exports = endsWith;
