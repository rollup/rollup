define(['./_asciiToArray.js', './_hasUnicode.js', './_unicodeToArray.js'], function (___asciiToArray_js, ___hasUnicode_js, ___unicodeToArray_js) { 'use strict';

  /**
   * Converts `string` to an array.
   *
   * @private
   * @param {string} string The string to convert.
   * @returns {Array} Returns the converted array.
   */
  function stringToArray(string) {
    return ___hasUnicode_js.default(string)
      ? ___unicodeToArray_js.default(string)
      : ___asciiToArray_js.default(string);
  }

  return stringToArray;

});
