define(['./_baseToString.js', './_castSlice.js', './_charsStartIndex.js', './_stringToArray.js', './toString.js'], function (___baseToString_js, ___castSlice_js, ___charsStartIndex_js, ___stringToArray_js, __toString_js) { 'use strict';

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

  return trimStart;

});
