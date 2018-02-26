'use strict';

var ___createPadding_js = require('./_createPadding.js');
var ___stringSize_js = require('./_stringSize.js');
var __toInteger_js = require('./toInteger.js');
var __toString_js = require('./toString.js');

/**
 * Pads `string` on the right side if it's shorter than `length`. Padding
 * characters are truncated if they exceed `length`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to pad.
 * @param {number} [length=0] The padding length.
 * @param {string} [chars=' '] The string used as padding.
 * @returns {string} Returns the padded string.
 * @example
 *
 * _.padEnd('abc', 6);
 * // => 'abc   '
 *
 * _.padEnd('abc', 6, '_-');
 * // => 'abc_-_'
 *
 * _.padEnd('abc', 3);
 * // => 'abc'
 */
function padEnd(string, length, chars) {
  string = __toString_js.default(string);
  length = __toInteger_js.default(length);

  var strLength = length ? ___stringSize_js.default(string) : 0;
  return (length && strLength < length)
    ? (string + ___createPadding_js.default(length - strLength, chars))
    : string;
}

module.exports = padEnd;
