'use strict';

var ___asciiSize_js = require('./_asciiSize.js');
var ___hasUnicode_js = require('./_hasUnicode.js');
var ___unicodeSize_js = require('./_unicodeSize.js');

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

module.exports = stringSize;
