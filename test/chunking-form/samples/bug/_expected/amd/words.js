define(['./_asciiWords.js', './_hasUnicodeWord.js', './toString.js', './_unicodeWords.js'], function (___asciiWords_js, ___hasUnicodeWord_js, __toString_js, ___unicodeWords_js) { 'use strict';

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

  return words;

});
