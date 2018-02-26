define(['./_baseToString.js', './_castSlice.js', './_charsEndIndex.js', './_stringToArray.js', './toString.js'], function (___baseToString_js, ___castSlice_js, ___charsEndIndex_js, ___stringToArray_js, __toString_js) { 'use strict';

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

  return trimEnd;

});
