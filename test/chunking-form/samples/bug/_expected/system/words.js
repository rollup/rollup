System.register(['./_asciiWords.js', './_hasUnicodeWord.js', './toString.js', './_unicodeWords.js'], function (exports, module) {
  'use strict';
  var asciiWords, hasUnicodeWord, toString, unicodeWords;
  return {
    setters: [function (module) {
      asciiWords = module.default;
    }, function (module) {
      hasUnicodeWord = module.default;
    }, function (module) {
      toString = module.default;
    }, function (module) {
      unicodeWords = module.default;
    }],
    execute: function () {

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
        string = toString(string);
        pattern = guard ? undefined : pattern;

        if (pattern === undefined) {
          return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
        }
        return string.match(pattern) || [];
      }
      exports('default', words);

    }
  };
});
