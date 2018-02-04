'use strict';

var ___asciiToArray_js = require('./_asciiToArray.js');
var ___hasUnicode_js = require('./_hasUnicode.js');
var ___unicodeToArray_js = require('./_unicodeToArray.js');

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

module.exports = stringToArray;
