define(['./_asciiSize.js', './_hasUnicode.js', './_unicodeSize.js'], function (___asciiSize_js, ___hasUnicode_js, ___unicodeSize_js) { 'use strict';

  /**
   * Gets the number of symbols in `string`.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {number} Returns the string size.
   */
  function stringSize(string) {
    return ___hasUnicode_js.default(string)
      ? ___unicodeSize_js.default(string)
      : ___asciiSize_js.default(string);
  }

  return stringSize;

});
