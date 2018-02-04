'use strict';

var ___baseRepeat_js = require('./_baseRepeat.js');
var ___baseToString_js = require('./_baseToString.js');
var ___castSlice_js = require('./_castSlice.js');
var ___hasUnicode_js = require('./_hasUnicode.js');
var ___stringSize_js = require('./_stringSize.js');
var ___stringToArray_js = require('./_stringToArray.js');

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeCeil = Math.ceil;

/**
 * Creates the padding for `string` based on `length`. The `chars` string
 * is truncated if the number of characters exceeds `length`.
 *
 * @private
 * @param {number} length The padding length.
 * @param {string} [chars=' '] The string used as padding.
 * @returns {string} Returns the padding for `string`.
 */
function createPadding(length, chars) {
  chars = chars === undefined ? ' ' : ___baseToString_js.default(chars);

  var charsLength = chars.length;
  if (charsLength < 2) {
    return charsLength ? ___baseRepeat_js.default(chars, length) : chars;
  }
  var result = ___baseRepeat_js.default(chars, nativeCeil(length / ___stringSize_js.default(chars)));
  return ___hasUnicode_js.default(chars)
    ? ___castSlice_js.default(___stringToArray_js.default(result), 0, length).join('')
    : result.slice(0, length);
}

module.exports = createPadding;
