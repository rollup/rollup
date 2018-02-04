'use strict';

var ___baseToString_js = require('./_baseToString.js');
var ___castSlice_js = require('./_castSlice.js');
var ___hasUnicode_js = require('./_hasUnicode.js');
var __isObject_js = require('./isObject.js');
var __isRegExp_js = require('./isRegExp.js');
var ___stringSize_js = require('./_stringSize.js');
var ___stringToArray_js = require('./_stringToArray.js');
var __toInteger_js = require('./toInteger.js');
var __toString_js = require('./toString.js');

/** Used as default options for `_.truncate`. */
var DEFAULT_TRUNC_LENGTH = 30,
    DEFAULT_TRUNC_OMISSION = '...';

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/**
 * Truncates `string` if it's longer than the given maximum string length.
 * The last characters of the truncated string are replaced with the omission
 * string which defaults to "...".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to truncate.
 * @param {Object} [options={}] The options object.
 * @param {number} [options.length=30] The maximum string length.
 * @param {string} [options.omission='...'] The string to indicate text is omitted.
 * @param {RegExp|string} [options.separator] The separator pattern to truncate to.
 * @returns {string} Returns the truncated string.
 * @example
 *
 * _.truncate('hi-diddly-ho there, neighborino');
 * // => 'hi-diddly-ho there, neighbo...'
 *
 * _.truncate('hi-diddly-ho there, neighborino', {
 *   'length': 24,
 *   'separator': ' '
 * });
 * // => 'hi-diddly-ho there,...'
 *
 * _.truncate('hi-diddly-ho there, neighborino', {
 *   'length': 24,
 *   'separator': /,? +/
 * });
 * // => 'hi-diddly-ho there...'
 *
 * _.truncate('hi-diddly-ho there, neighborino', {
 *   'omission': ' [...]'
 * });
 * // => 'hi-diddly-ho there, neig [...]'
 */
function truncate(string, options) {
  var length = DEFAULT_TRUNC_LENGTH,
      omission = DEFAULT_TRUNC_OMISSION;

  if (__isObject_js.default(options)) {
    var separator = 'separator' in options ? options.separator : separator;
    length = 'length' in options ? __toInteger_js.default(options.length) : length;
    omission = 'omission' in options ? ___baseToString_js.default(options.omission) : omission;
  }
  string = __toString_js.default(string);

  var strLength = string.length;
  if (___hasUnicode_js.default(string)) {
    var strSymbols = ___stringToArray_js.default(string);
    strLength = strSymbols.length;
  }
  if (length >= strLength) {
    return string;
  }
  var end = length - ___stringSize_js.default(omission);
  if (end < 1) {
    return omission;
  }
  var result = strSymbols
    ? ___castSlice_js.default(strSymbols, 0, end).join('')
    : string.slice(0, end);

  if (separator === undefined) {
    return result + omission;
  }
  if (strSymbols) {
    end += (result.length - end);
  }
  if (__isRegExp_js.default(separator)) {
    if (string.slice(end).search(separator)) {
      var match,
          substring = result;

      if (!separator.global) {
        separator = RegExp(separator.source, __toString_js.default(reFlags.exec(separator)) + 'g');
      }
      separator.lastIndex = 0;
      while ((match = separator.exec(substring))) {
        var newEnd = match.index;
      }
      result = result.slice(0, newEnd === undefined ? end : newEnd);
    }
  } else if (string.indexOf(___baseToString_js.default(separator), end) != end) {
    var index = result.lastIndexOf(separator);
    if (index > -1) {
      result = result.slice(0, index);
    }
  }
  return result + omission;
}

module.exports = truncate;
