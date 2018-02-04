'use strict';

var ___asciiWords_js = require('./_asciiWords.js');
var ___hasUnicodeWord_js = require('./_hasUnicodeWord.js');
var __toString_js = require('./toString.js');
var ___unicodeWords_js = require('./_unicodeWords.js');

/**
 * Splits `string` into an array of its words.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to inspect.
 * @param {RegExp|string} [pattern] The pattern to match words.
 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
 * @returns {Array} Returns the words of `string`.
 * @example
 *
 * _.words('fred, barney, & pebbles');
 * // => ['fred', 'barney', 'pebbles']
 *
 * _.words('fred, barney, & pebbles', /[^, ]+/g);
 * // => ['fred', 'barney', '&', 'pebbles']
 */
function words(string, pattern, guard) {
  string = __toString_js.default(string);
  pattern = guard ? undefined : pattern;

  if (pattern === undefined) {
    return ___hasUnicodeWord_js.default(string) ? ___unicodeWords_js.default(string) : ___asciiWords_js.default(string);
  }
  return string.match(pattern) || [];
}

module.exports = words;
