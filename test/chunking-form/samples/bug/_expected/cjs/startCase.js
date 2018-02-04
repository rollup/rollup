'use strict';

var ___createCompounder_js = require('./_createCompounder.js');
var __upperFirst_js = require('./upperFirst.js');

/**
 * Converts `string` to
 * [start case](https://en.wikipedia.org/wiki/Letter_case#Stylistic_or_specialised_usage).
 *
 * @static
 * @memberOf _
 * @since 3.1.0
 * @category String
 * @param {string} [string=''] The string to convert.
 * @returns {string} Returns the start cased string.
 * @example
 *
 * _.startCase('--foo-bar--');
 * // => 'Foo Bar'
 *
 * _.startCase('fooBar');
 * // => 'Foo Bar'
 *
 * _.startCase('__FOO_BAR__');
 * // => 'FOO BAR'
 */
var startCase = ___createCompounder_js.default(function(result, word, index) {
  return result + (index ? ' ' : '') + __upperFirst_js.default(word);
});

module.exports = startCase;
