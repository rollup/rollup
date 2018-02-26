'use strict';

var ___baseToString_js = require('./_baseToString.js');
var ___castSlice_js = require('./_castSlice.js');
var ___hasUnicode_js = require('./_hasUnicode.js');
var ___isIterateeCall_js = require('./_isIterateeCall.js');
var __isRegExp_js = require('./isRegExp.js');
var ___stringToArray_js = require('./_stringToArray.js');
var __toString_js = require('./toString.js');

/** Used as references for the maximum length and index of an array. */
var MAX_ARRAY_LENGTH = 4294967295;

/**
 * Splits `string` by `separator`.
 *
 * **Note:** This method is based on
 * [`String#split`](https://mdn.io/String/split).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to split.
 * @param {RegExp|string} separator The separator pattern to split by.
 * @param {number} [limit] The length to truncate results to.
 * @returns {Array} Returns the string segments.
 * @example
 *
 * _.split('a-b-c', '-', 2);
 * // => ['a', 'b']
 */
function split(string, separator, limit) {
  if (limit && typeof limit != 'number' && ___isIterateeCall_js.default(string, separator, limit)) {
    separator = limit = undefined;
  }
  limit = limit === undefined ? MAX_ARRAY_LENGTH : limit >>> 0;
  if (!limit) {
    return [];
  }
  string = __toString_js.default(string);
  if (string && (
        typeof separator == 'string' ||
        (separator != null && !__isRegExp_js.default(separator))
      )) {
    separator = ___baseToString_js.default(separator);
    if (!separator && ___hasUnicode_js.default(string)) {
      return ___castSlice_js.default(___stringToArray_js.default(string), 0, limit);
    }
  }
  return string.split(separator, limit);
}

module.exports = split;
