define(['./_baseToString.js', './_castSlice.js', './_hasUnicode.js', './_isIterateeCall.js', './isRegExp.js', './_stringToArray.js', './toString.js'], function (___baseToString_js, ___castSlice_js, ___hasUnicode_js, ___isIterateeCall_js, __isRegExp_js, ___stringToArray_js, __toString_js) { 'use strict';

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

  return split;

});
