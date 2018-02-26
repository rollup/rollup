'use strict';

var ___createCompounder_js = require('./_createCompounder.js');

/**
 * Converts `string`, as space separated words, to upper case.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category String
 * @param {string} [string=''] The string to convert.
 * @returns {string} Returns the upper cased string.
 * @example
 *
 * _.upperCase('--foo-bar');
 * // => 'FOO BAR'
 *
 * _.upperCase('fooBar');
 * // => 'FOO BAR'
 *
 * _.upperCase('__foo_bar__');
 * // => 'FOO BAR'
 */
var upperCase = ___createCompounder_js.default(function(result, word, index) {
  return result + (index ? ' ' : '') + word.toUpperCase();
});

module.exports = upperCase;
