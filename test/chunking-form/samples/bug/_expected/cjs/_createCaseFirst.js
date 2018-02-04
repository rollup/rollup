'use strict';

var ___castSlice_js = require('./_castSlice.js');
var ___hasUnicode_js = require('./_hasUnicode.js');
var ___stringToArray_js = require('./_stringToArray.js');
var __toString_js = require('./toString.js');

/**
 * Creates a function like `_.lowerFirst`.
 *
 * @private
 * @param {string} methodName The name of the `String` case method to use.
 * @returns {Function} Returns the new case function.
 */
function createCaseFirst(methodName) {
  return function(string) {
    string = __toString_js.default(string);

    var strSymbols = ___hasUnicode_js.default(string)
      ? ___stringToArray_js.default(string)
      : undefined;

    var chr = strSymbols
      ? strSymbols[0]
      : string.charAt(0);

    var trailing = strSymbols
      ? ___castSlice_js.default(strSymbols, 1).join('')
      : string.slice(1);

    return chr[methodName]() + trailing;
  };
}

module.exports = createCaseFirst;
