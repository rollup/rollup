'use strict';

var ___baseToString_js = require('./_baseToString.js');
var ___castSlice_js = require('./_castSlice.js');
var ___charsEndIndex_js = require('./_charsEndIndex.js');
var ___charsStartIndex_js = require('./_charsStartIndex.js');
var ___stringToArray_js = require('./_stringToArray.js');
var __toString_js = require('./toString.js');

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/**
 * Removes leading and trailing whitespace or specified characters from `string`.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to trim.
 * @param {string} [chars=whitespace] The characters to trim.
 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
 * @returns {string} Returns the trimmed string.
 * @example
 *
 * _.trim('  abc  ');
 * // => 'abc'
 *
 * _.trim('-_-abc-_-', '_-');
 * // => 'abc'
 *
 * _.map(['  foo  ', '  bar  '], _.trim);
 * // => ['foo', 'bar']
 */
function trim(string, chars, guard) {
  string = __toString_js.default(string);
  if (string && (guard || chars === undefined)) {
    return string.replace(reTrim, '');
  }
  if (!string || !(chars = ___baseToString_js.default(chars))) {
    return string;
  }
  var strSymbols = ___stringToArray_js.default(string),
      chrSymbols = ___stringToArray_js.default(chars),
      start = ___charsStartIndex_js.default(strSymbols, chrSymbols),
      end = ___charsEndIndex_js.default(strSymbols, chrSymbols) + 1;

  return ___castSlice_js.default(strSymbols, start, end).join('');
}

module.exports = trim;
