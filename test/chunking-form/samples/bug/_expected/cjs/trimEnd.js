'use strict';

var ___baseToString_js = require('./_baseToString.js');
var ___castSlice_js = require('./_castSlice.js');
var ___charsEndIndex_js = require('./_charsEndIndex.js');
var ___stringToArray_js = require('./_stringToArray.js');
var __toString_js = require('./toString.js');

/** Used to match leading and trailing whitespace. */
var reTrimEnd = /\s+$/;

/**
 * Removes trailing whitespace or specified characters from `string`.
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
 * _.trimEnd('  abc  ');
 * // => '  abc'
 *
 * _.trimEnd('-_-abc-_-', '_-');
 * // => '-_-abc'
 */
function trimEnd(string, chars, guard) {
  string = __toString_js.default(string);
  if (string && (guard || chars === undefined)) {
    return string.replace(reTrimEnd, '');
  }
  if (!string || !(chars = ___baseToString_js.default(chars))) {
    return string;
  }
  var strSymbols = ___stringToArray_js.default(string),
      end = ___charsEndIndex_js.default(strSymbols, ___stringToArray_js.default(chars)) + 1;

  return ___castSlice_js.default(strSymbols, 0, end).join('');
}

module.exports = trimEnd;
