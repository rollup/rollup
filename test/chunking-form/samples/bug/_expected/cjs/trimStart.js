'use strict';

var ___baseToString_js = require('./_baseToString.js');
var ___castSlice_js = require('./_castSlice.js');
var ___charsStartIndex_js = require('./_charsStartIndex.js');
var ___stringToArray_js = require('./_stringToArray.js');
var __toString_js = require('./toString.js');

/** Used to match leading and trailing whitespace. */
var reTrimStart = /^\s+/;

/**
 * Removes leading whitespace or specified characters from `string`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to trim.
 * @param {string} [chars=whitespace] The characters to trim.
 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
 * @returns {string} Returns the trimmed string.
 * @example
 *
 * _.trimStart('  abc  ');
 * // => 'abc  '
 *
 * _.trimStart('-_-abc-_-', '_-');
 * // => 'abc-_-'
 */
function trimStart(string, chars, guard) {
  string = __toString_js.default(string);
  if (string && (guard || chars === undefined)) {
    return string.replace(reTrimStart, '');
  }
  if (!string || !(chars = ___baseToString_js.default(chars))) {
    return string;
  }
  var strSymbols = ___stringToArray_js.default(string),
      start = ___charsStartIndex_js.default(strSymbols, ___stringToArray_js.default(chars));

  return ___castSlice_js.default(strSymbols, start).join('');
}

module.exports = trimStart;
