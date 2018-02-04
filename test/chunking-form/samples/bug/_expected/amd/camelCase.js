define(['./capitalize.js', './_createCompounder.js'], function (__capitalize_js, ___createCompounder_js) { 'use strict';

  /**
   * Converts `string` to [camel case](https://en.wikipedia.org/wiki/CamelCase).
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category String
   * @param {string} [string=''] The string to convert.
   * @returns {string} Returns the camel cased string.
   * @example
   *
   * _.camelCase('Foo Bar');
   * // => 'fooBar'
   *
   * _.camelCase('--foo-bar--');
   * // => 'fooBar'
   *
   * _.camelCase('__FOO_BAR__');
   * // => 'fooBar'
   */
  var camelCase = ___createCompounder_js.default(function(result, word, index) {
    word = word.toLowerCase();
    return result + (index ? __capitalize_js.default(word) : word);
  });

  return camelCase;

});
