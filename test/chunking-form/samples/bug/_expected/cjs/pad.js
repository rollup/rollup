'use strict';

var ___createPadding_js = require('./_createPadding.js');
var ___stringSize_js = require('./_stringSize.js');
var __toInteger_js = require('./toInteger.js');
var __toString_js = require('./toString.js');

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeCeil = Math.ceil,
    nativeFloor = Math.floor;

/**
 * Pads `string` on the left and right sides if it's shorter than `length`.
 * Padding characters are truncated if they can't be evenly divided by `length`.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to pad.
 * @param {number} [length=0] The padding length.
 * @param {string} [chars=' '] The string used as padding.
 * @returns {string} Returns the padded string.
 * @example
 *
 * _.pad('abc', 8);
 * // => '  abc   '
 *
 * _.pad('abc', 8, '_-');
 * // => '_-abc_-_'
 *
 * _.pad('abc', 3);
 * // => 'abc'
 */
function pad(string, length, chars) {
  string = __toString_js.default(string);
  length = __toInteger_js.default(length);

  var strLength = length ? ___stringSize_js.default(string) : 0;
  if (!length || strLength >= length) {
    return string;
  }
  var mid = (length - strLength) / 2;
  return (
    ___createPadding_js.default(nativeFloor(mid), chars) +
    string +
    ___createPadding_js.default(nativeCeil(mid), chars)
  );
}

module.exports = pad;
